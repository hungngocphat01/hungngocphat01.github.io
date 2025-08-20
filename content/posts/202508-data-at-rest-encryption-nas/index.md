+++
date = '2025-08-20T23:42:50+09:00'
title = 'Setting up a simple homelab NAS with data-at-rest encryption'
tags = ['project']
featuredImage = "cover.jpeg"
+++

This article is a draft.

**Data-at-rest encryption** is an important but often overlooked aspect of home servers and NAS devices. In my case, the NAS is just a Mac Mini (Ubuntu) attached to a LAN/Thunderbolt cable, sitting on a shelf in my laboratory. That machine could be **physically assaulted** by anyone while I am away. For instance, an attacker could boot into a live USB and immediately gain access to all files stored in the clear.

Or another scenario: when I graduate, I might forget to wipe the NAS and simply leave it behind at the institute. This was the case with the _two_ previous owners of the machine from two different periods in 15 years, as their OSX user accounts were still accessible when I dug the Mac up from dust. This Mac was too old to even have iCloud protection.

Even if I format the drive, without **overwriting it** with zeros or random data, it's possible for the machine to become a testing subject of some curious student researching information security living 10 years in the future.


{{< admonition type=info title="Info" open=true >}}

These are not the only scenarios where this concept comes into play. I recommend checking out the article on this topic on [ArchWiki](https://wiki.archlinux.org/title/Data-at-rest_encryption).

{{< /admonition >}}


To protect against such situations, we can apply data-at-rest encryption. 
## 1. Preview of final setup

The goal is simple: **data is only readable when we *explicitly* unlock it, and remains unreadable in every other case.**

The final configuration looks like this:

1. A file server that serves over **SFTP**, writing to an **encrypted LUKS volume** separated from the OS volume.
2. The LUKS container is **automatically mounted only during use**, and unmounted after the last session closes.
   
   Authentication is primarily through a **passphrase**. This is for both security and convenience purposes.
3. Only the data container is encrypted; the OS volume is unencrypted.

    This allows for quick recovery in case of a power failure. The host system can reboot headlessly, reconnect to the network, and be immediately ready for use again without the need of attaching a monitor or keyboard.

{{< admonition type=danger title="Important" open=true >}}

Since the OS volume is not encrypted, while your **data is safe at-rest**, it is **not hardened** against deliberate professional attacks. 

An adversary could still boot into a live environment, plant malicious scripts onto the host OS only waiting for victim to log in again. The scripts now run with full privileges as the legit user. No one could know what happens next.

{{< /admonition >}}

{{< admonition type=danger title="Disclaimer" open=true >}}

This setup is generally safe over _casual attacks_. However, if the NAS stores confidential data, you should also consider encrypting the OS partition with LUKS.

{{< /admonition >}}


---

## 2. LUKS and LVM

You have probably come across "LUKS" and "LVM" many times before. At first, they may look like intimidating Linux acronyms you would never actually use, but in practice they are very useful. A brief explanation is given below; for details, consult the corresponding ArchWiki articles.

### 2.1. LUKS

LUKS (Linux Unified Key Setup) is the standard for disk encryption on Linux. Under the hood, it uses the Linux kernel's [dm-crypt](https://wiki.archlinux.org/title/Dm-crypt/Encrypting_a_non-root_file_system) (cryptographic device mapping) subsystem. LUKS supports multiple keyslots (up to 32 for LUKS2), meaning you can configure **up to 32 different "passwords"** to unlock the same encrypted container, which is useful for redundancy.

There are two key types:

* **Passphrase**: the good ol' text password
* **Keyfile**: any arbitrary binary file (e.g., could be a JPEG of your waifu), ideally stored on external media.

In this setup, you will need to set up at least one passphrase. Later, we will create a dedicated Linux user account to access the encrypted container. The password for this account should match the aforementioned passphrase.

A block-device encryption method like LUKS works with very little overhead (translating to faster write speed) compared to overlay filesystem methods such as `gocryptfs`. This is helpful if you're working with a spinning hard drive.

Most interaction with the LUKS subsystem would be through the `cryptsetup` command.

### 2.2. LVM

[LVM (Logical Volume Manager)](https://wiki.archlinux.org/title/LVM) is an abstraction layer on top of physical storage. It allows you to create, resize, and manage storage volumes more flexibly than working directly with raw partitions. **For this NAS setup, LVM is optional**. You can complete everything without it. You can skim through the core concepts of LVM in the [Appendix](#appendix-lvm-shenanigans).

LVM differs from Btrfs and APFS, where volumes are tied to a single filesystem type. An LVM volume group can contain multiple logical volumes, each formatted with different filesystems (e.g. ext4, Btrfs, NTFS).


## 3. Setting up networking

If you are running a headless machine like I am, it is more convenient to perform all setup steps remotely over SSH. Note that these steps are specific to **Ubuntu** as of 24.03 LTS.

### 3.1. Enabling firewall

```bash
sudo ufw enable
sufo ufw allow ssh
sudo ufw status
```

### 3.2. Configuring a static IP address

The preferred method is to assign a static IP through your router’s configuration. If this is not possible, you may configure it directly on the host as a workaround:

Create `/etc/netplan/99-static-ip.yaml` with the following content. Replace `ens9` with your actual network interface and `yy` with the subnet mask.

```yaml
network:
  version: 2
  ethernets:
    ens9:
      addresses:
        - xx.xx.xx.xx/yy
```

Then apply the configuration:

```bash
sudo netplan apply
```

`ping 8.8.8.8` to see if you can connect to the internet.

---

## 4. Preparing the filesystem

### 4.1. Creating a new volume

#### With LVM

{{< admonition type=info title="LVM is optional" open=true >}}

The commands for creating a LUKS volume without LVM are also available.

But if you plan to use LVM, be sure to grasp its core concepts discussed in the [Appendix](#appendix-lvm-shenanigans) before executing `lvcreate`.

{{< /admonition >}}

Create a logical volume for the encrypted container, using all free space in Ubuntu's default volume group (`ubuntu-vg`). Replace `luks-lv` with any name you like.

```bash
sudo vgdisplay  # show all volume groups
sudo lvcreate -l 100%FREE ubuntu-vg -n luks-lv
```
The corresponding block device for this logical volume would be available as `/dev/ubuntu-vg/luks-lv`.

```bash
$ sudo vgdisplay

  --- Logical volume ---
  LV Path                /dev/ubuntu-vg/ubuntu-lv
  LV Name                ubuntu-lv
  VG Name                ubuntu-vg
  LV UUID                xxx
  LV Write Access        read/write
  LV Creation host, time ubuntu-server, 2025-08-20 12:14:30 +0000
  LV Status              available
  # open                 1
  LV Size                100.00 GiB
  Current LE             25600
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           252:0

  --- Logical volume ---
  LV Path                /dev/ubuntu-vg/luks-lv
  LV Name                luks-lv
  VG Name                ubuntu-vg
  LV UUID                xxx
  LV Write Access        read/write
  LV Creation host, time hiraki-macmini, 2025-08-20 12:41:39 +0000
  LV Status              available
  # open                 0
  LV Size                <362.71 GiB
  Current LE             92853
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           252:1
```

#### Without LVM

Just use gparted to spare a normal `sdaX` partition from your disk. You don't need to format it with ext4 or btrfs yet.

### 4.2. Format and open the LUKS container

#### Format as LUKS

Instead of putting a regular filesystem directly on `sdaX`, the first step is to initialize it as a LUKS container. This marks the partition (called the _target_ block device) as encrypted and requires a password (passphrase) for access.


```bash
# This command will ask you to create a passphrase. -v enables verbose output
sudo cryptsetup luksFormat -v /dev/sdaX                 # without lvm
sudo cryptsetup luksFormat -v /dev/ubuntu-vg/luks-lv    # lvm
```

#### Exposing plaintext view

After formatting, the LUKS device must be opened. Data will be encrypted/decrypted on-the-fly and a new _virtual_ block device is created, which behaves exactly like an ordinary disk. Replace `luks-container` with any name you prefer.

```bash
sudo cryptsetup luksOpen /dev/sdaX "luks-container"                 # without lvm
sudo cryptsetup luksOpen /dev/ubuntu-vg/luks-lv "luks-container"    # lvm
```

A new _virtual_ block device `/dev/mapper/luks-container` will be available. Now you can actually **format** it like any normal disk drive:

#### Put a filesystem onto the decrypted volume

```bash
sudo mkfs.ext4 /dev/mapper/luks-container
```

---

## 5. Setting up access control

Create a dedicated user (e.g. `files`) to own the encrypted data. Idealistically, this user should not be added into `sudoers` or be granted with any extra permission.

{{< admonition type=warning title="Password usage" open=true >}}

Use the same password as your LUKS passphrase for this user.

{{< /admonition >}}

```bash
sudo useradd -u 2000 -U -m files
# -u: user id
# -U: also create a group with the same name
# -m: creates a home directory

sudo passwd files
sudo chsh -s /bin/bash files
```

Mount the encrypted container and adjust permissions:

```bash
sudo mount -o noatime,nodev,nosuid /dev/mapper/luks-container /data
sudo chown files /data
sudo chmod 700 /data
```

Refer to [here](https://serverfault.com/questions/547237/explanation-of-nodev-and-nosuid-in-fstab) for the explanation of `nodev,nosuid` options.

---

## 6. Setting up automatic mount on login/connect

To make the container mount automatically when you logs in over SSH/SFTP, install PAM mount:

```bash
sudo apt install libpam-mount
```

Get the logical volume's `UUID`. Note that you issue the command on the target block device, not the LUKS mapper:

```bash
blkid /dev/sdaX                 # without lvm
blkid /dev/ubuntu-vg/luks-lv    # lvm
```

Add the following line to `/etc/security/pam_mount.conf.xml` under `Volumes definitions`. Replace `user`, `crypto_name` with your values if applicable.

```xml
<volume
    user="files"
    fstype="crypt" 
    path="/dev/disk/by-uuid/xxx"
    mountpoint="/data"
    options="crypto_name=luks-container,noatime,nodev,nosuid"
/>
```

Now check if it automatically mounts on login:

```bash
su files
```

---

## 7. Client-side software

scp, rsync, rclone (write later).

## A. Appendix

### Appendix: LVM shenanigans

This is a bad summary of the [ArchWiki](https://wiki.archlinux.org/title/LVM) article on LVM.

In LVM terms, a **logical volume (LV)** belongs in a **volume group (VG)**. A VG could span across one or many **partitions/physical volumes (PV)** (which, in turn, could lie on multiple physical disk drives).

{{< admonition type=info title="For APFS/BTRFS users" open=true >}}

| LVM | BTRFS | APFS |
| - | - | - |
| Volume group | Volume | Container |
| Logical volume | Subvolume | Volume |
| Physical volume | Partition | Partition |

{{< /admonition >}}

```                            
           ┌───────────────┐   
       ┌───►  Phys Volume  │   
       │   └───────┬───────┘   
       │           │           
       │       Belongs to      
       │           │           
       │   ┌───────▼───────┐   
  Sits │   │ Volume Group  │   
 inside│   └───────┬───────┘   
       │           │           
       │       Contains        
       │           │           
       │   ┌───────▼───────┐   
       └───┤  Logical Vol  │   
           └───────────────┘   
```

However, LVM differs from Btrfs and APFS, where volumes are tied to a single filesystem type. An LVM volume group can contain multiple logical volumes, each formatted with different filesystems (e.g. ext4, Btrfs, NTFS).

#### Example from an actual setup

In my setup, I have a one single physical drive, which is divided into **three partitions/physical volumes** sda*X*.

```bash
NAME                      MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda                         8:0    0 465.8G  0 disk
├─sda1                      8:1    0     1G  0 part /boot/efi
├─sda2                      8:2    0     2G  0 part /boot
└─sda3                      8:3    0 462.7G  0 part
```

Normally, `sda3` would be your root partition formatted with ext4 or btrfs. When using LVM, however, a **volume group** is created, and `sda3` becomes part of its storage pool. The **logical volume** holding your root filesystem is then created inside this VG.

These relationships could be seen in the commands for manually creating a VG and a LV:

```bash
sudo vgcreate MyVolGroup /dev/sda3
sudo lvcreate -l 50G MyVolGroup -n my-logical-vol
```

If you have installed Ubuntu with LVM enabled, by default it will create the `ubuntu-vg` volume group. You could reuse it like I do, or create another VG.

```bash
$ sudo vgdisplay

  --- Volume group ---
  VG Name               ubuntu-vg
  System ID
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  3
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                2
  Open LV               1
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               <462.71 GiB
  PE Size               4.00 MiB
  Total PE              118453
  Alloc PE / Size       118453 / <462.71 GiB
  Free  PE / Size       0 / 0
  VG UUID               xxx
```

It's easy to recognize the `VG Size` matches the size of the `sda3` partition.

You can list all LVs with the `lvdisplay` command. Here, the Ubuntu root volume is `ubuntu-lv`, which is part of `ubuntu-vg` sitting inside `/dev/sda3`.

```bash
$ sudo lvdisplay
  --- Logical volume ---
  LV Path                /dev/ubuntu-vg/ubuntu-lv
  LV Name                ubuntu-lv
  VG Name                ubuntu-vg
  LV UUID                xxx
  LV Write Access        read/write
  LV Creation host, time ubuntu-server, 2025-08-20 12:14:30 +0000
  LV Status              available
  # open                 1
  LV Size                100.00 GiB
  Current LE             25600
  Segments               1
  Allocation             inherit
  Read ahead sectors     auto
  - currently set to     256
  Block device           252:0
```

If you were interact with this volume as if it is a normal block device (like formatting), it's still there in `/dev/`:

```bash
$ sudo mkfs.ext4 /dev/ubuntu-vg/ubuntu-lv
# This would format the logical volume sitting inside /dev/sda3
```

You can add more logical volumes into the volume group `ubuntu-vg` as described in [4.1. Creating a new volume](#41-creating-a-new-volume).

### Appendix: Impirical experiments against gocryptfs

The main advantage of this LUKS approach over gocryptfs is the **low overhead**.

(write later)