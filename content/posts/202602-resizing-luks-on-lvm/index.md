+++
date = '2026-02-28T16:25:32+09:00'
title = 'Resizing LUKS on LVM'
tags = ['project']
featuredImage = "cover.jpeg"
+++

{{< admonition type=danger title="Disclaimer" open=true >}}

I am not responsible for any data loss that may occur as a result of following this guide.

{{< /admonition >}}

A while ago, I encrypted my home server's disks using a **LUKS on LVM** setup. While this setup works great, sometimes you might need to free up some space from an existing encrypted volume to create a new one. Because the storage setup is layered--**ext4 on LUKS on LVM**--resizing isn't as simple as it looks.

To achieve this, we have to manipulate the different abstraction layers in the correct order.

{{< admonition type=danger title="The golden rule of shrinking" open=true >}}

Layered abstractions work like boxes in boxes. You must always **shrink the inner box first**, before shrinking the outer boxes. Doing this in reverse will crop your filesystem while it's unaware, which will **destroy your data**.

{{< /admonition >}}

To safely shrink an encrypted volume, we use a *safety-margin* approach: 

1. We shrink the *filesystem* to be slightly *smaller* than our target size
2. Shrink the *logical volume* to our *target size*
3. Expand the *filesystem* back to our *target size*

That means: if you want to shrink the volume to 122G, you should shrink the filesystem to 120G first, then shrink the logical volume to 122G, and finally expand the filesystem back to 122G.

## 1. Preliminaries

Before we dive into the commands, let's clarify a few concepts to understand *why* we need to shrink things in a specific order. A key takeaway is that **a filesystem** is not the same as the underlying logical **volume** it sits on. It's important for users who are only familiar with graphical tools to grasp these concepts clearly.

A **volume** is a way to separate different filesystems on a disk. A **filesystem**, such as `ext4`, `btrfs`, or `FAT32`, is the data structure written onto that raw space. It governs how the raw bytes on disk are *organized* and could be *interpreted* as files or directories.

When you create files on a filesystem, they are not always stored in a simple left-to-right order. Instead, files and directories can be scattered across the disk, sometimes ending up near the end of the filesystem. If you shrink the volume without first shrinking the filesystem, you may cut off part of the filesystem and destroy your data.

To visualize it, think of the filesystem = the library, while the volume = the building. You would not want to just chop off a part of the building without moving the books first.

When you use a graphical tool like GParted or Disk Utility to visually drag and "shrink" a volume, the software is actually doing two things under the hood:
1. First, it shrinks the **filesystem**, safely moving any data away from the end of the volume and compacts the filesystem's internal structures.
2. Second, it shrinks the actual **volume** boundary (by updating the partition table or volume metadata) to match the new, smaller 
filesystem size. 

{{< admonition type=info title="With LUKS" open=true >}}

With LUKS on top of LVM, the process is largely the same. <u>LUKS does not actually manage the size of the filesystem</u>. However, it needs several megabytes of free space at the beginning of the volume for its metadata, so leaving a bigger margin is always a good idea. This is important, though, since if you crop away a few megabytes at the end, the encrypted data will be corrupted, and you'll have bigger problem to solve.

{{< /admonition >}}

{{< figure src="figure-fs-resize.jpg" >}}

**The full flow with LUKS on top of LVM is as follows**:

1. Open LUKS
2. Shrink the filesystem to 120G
3. Close LUKS
4. Shrink the logical volume to 122G
5. Open LUKS
6. Expand the filesystem to 122G

## 2. Inspecting the current layout

Assume we have one volume group `ubuntu-vg`, and the LUKS logical volume in question is `luks-lv`.

First, let's look at the current logical volume setup. We can use `lvdisplay` to inspect the names of the logical volumes.

```bash
$ sudo lvdisplay
  [...]

  --- Logical volume ---
  LV Path                /dev/ubuntu-vg/luks-lv
  LV Name                luks-lv
  VG Name                ubuntu-vg
  LV UUID                W2VmBP-Mpdj-OFWf-Wfr9-ql8r-wfBq-L6dWCg
  LV Write Access        read/write
  LV Creation host, time hiraki-macmini, 2025-08-20 12:41:39 +0000
  LV Status              available
  # open                 1
  LV Size                <362.71 GiB
  Current LE             92853
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           252:1
```

Let's also inspect the decrypted LUKS view using `parted`.

```bash
$ sudo parted -l
[...]

Model: Linux device-mapper (crypt) (dm)
Disk /dev/mapper/luks-decrypted: 389GB
Sector size (logical/physical): 512B/512B
Partition Table: loop
Disk Flags:

Number  Start  End    Size   File system  Flags
 1      0.00B  389GB  389GB  ext4
```

As we can see, the logical volume `luks-lv` spans about 389 GiB (displayed as 389 GB in base-10), mapped to a LUKS container with an `ext4` filesystem. Our goal here is to reduce its size down to around 122 GiB.

---

## 2. Shrinking the inner filesystem

Decrypt the LUKS volume to reveal the underlying ext4 filesystem.

```bash
sudo cryptsetup open /dev/mapper/luks-lv luks-decrypted
```

Next, check the filesystem for errors to prevent bad surprises during the resize operation. Make sure the filesystem is not mounted at this stage.

```bash
sudo e2fsck -f /dev/mapper/luks-decrypted
```

Next, we **shrink the filesystem**. Suppose that our target size for the volume is `122G`, but we intentionally shrink the filesystem down to `120G` to leave a 2 GiB safety margin. This ensures we don't accidentally cut off the tail end of our files.

```bash
# This command will take a while
$ sudo resize2fs /dev/mapper/luks-decrypted 120G

resize2fs 1.47.0 (5-Feb-2023)
Resizing the filesystem on /dev/mapper/luks-decrypted to 31457280 (4k) blocks.
The filesystem on /dev/mapper/luks-decrypted is now 31457280 (4k) blocks long.
```

<!-- {{< admonition type=info title="LUKS Size" open=true >}}

Unlike LVM or a standard partition, **LUKS does not explicitly store the information about its size**. 

It dynamically adapts to the underlying block device. Setting the filesystem to 120G leaves trailing empty space inside the LUKS container, which is completely fine. Once you close and reopen the device, the size will change accordingly based on the host volume.

For instance, checking the size right now would still show the old size:
```bash
sudo blockdev --getsize64 /dev/mapper/luks-decrypted
# 389436932096
```

{{< /admonition >}} -->

---

## 3. Shrinking the logical volume

Now that our inner filesystem is comfortably sitting at 120 GiB, we can safely shrink the underlying physical LVM logical volume to our target of `122G`.

```bash
$ sudo cryptsetup close luks-decrypted
$ sudo lvresize -L 122G /dev/ubuntu-vg/luks-lv

  WARNING: Reducing active logical volume to 122.00 GiB.
  THIS MAY DESTROY YOUR DATA (filesystem etc.)
Do you really want to reduce ubuntu-vg/luks-lv? [y/n]: y
  Size of logical volume ubuntu-vg/luks-lv changed from <362.71 GiB (92853 extents) to 122.00 GiB (31232 extents).
  Logical volume ubuntu-vg/luks-lv successfully resized.
```

---

## 4. Expanding the filesystem back up

The logical volume is now strictly bound at 122 GiB. The LUKS container naturally adapts to this new 122 GiB constraint. 

However, our `ext4` filesystem inside it is still configured to be only 120 GiB. We can now run `resize2fs` again, but this time **without** specifying a size. This tells it to automatically expand and fill up all the available space left in its volume block.

```bash
$ sudo cryptsetup open /dev/mapper/luks-lv luks-decrypted
$ sudo resize2fs /dev/mapper/luks-decrypted

resize2fs 1.47.0 (5-Feb-2023)
Resizing the filesystem on /dev/mapper/luks-decrypted to 31977472 (4k) blocks.
The filesystem on /dev/mapper/luks-decrypted is now 31977472 (4k) blocks long.
```

This final expansion perfectly zeroes in on the exact boundary. We now just need to run one final command before mounting the volume. This will update the "management" size of the LUKS container to match the new volume size.

```bash
$ sudo cryptsetup resize /dev/mapper/luks-decrypted
```

Now mount the volume and check the size.

```bash
$ sudo mount -o nosuid,noexec,relatime /dev/mapper/luks-decrypted /mnt
$ df -h /mnt

Filesystem      Size  Used Avail Use% Mounted on
/dev/mapper/luks-decrypted
                122G   10G  106G   9% /mnt
```

---

## 5. Reclaiming the free space

With `luks-lv` successfully reduced from 362 GiB to 122 GiB, the remainder of the space has been returned to the `ubuntu-vg` volume group.

You can finally create a new logical volume (`data-lv`) utilizing all of that freshly freed up space:

```bash
sudo lvcreate -l 100%FREE ubuntu-vg -n data-lv
```

---

## 6. References

[1] https://unix.stackexchange.com/questions/322905/what-does-cryptsetup-resize-do-if-luks-doesnt-store-partition-size
