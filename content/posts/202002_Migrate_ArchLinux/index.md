+++
date = '2020-02-23T15:04:50+07:00'
title = 'Migrating Arch Linux between partitions without formatting'
tags = ['guide']
featuredImage = "hero.jpeg"
+++

Typings commands while looking at ArchWiki on another PC. Setting up DEs. Dotfiles. Applications. These are all the tedious tasks you face when reinstalling Arch Linux. 

This guide presents a method to clone your existing Arch installation from one partition to another without the need to start from scratch. This approach is particularly useful when you need to modify partition layouts in a dual-boot setup without losing your configured system.

{{< admonition type=warning title="Deprecation in 2025" open=true >}}
This guide was written in 2020 and some commands might have been deprecated. 
Reader's discretion is advised.
{{< /admonition >}}

# 1. Prepare

- A (newly created and) large enough partition to hold your Arch installation has to be created prior to following below steps.
- A new EFI partition also has to be existed/created in the destination disk if you want to remove your old disk (e.g. replacing your HDD with an SSD), or in case you want to wipe your old disk for other purposes. If not, you can still reuse your current EFI partition.
- Arch Installation Media.
- Make sure the disk(s) containing both of the partitions as well as the EFI partition have to be accessible from the Arch Installer.
- **Backup your important data** to another partition. Actually, this step is not really necessary since we will be only reading from our "old" partition without writing anything to it, but... who knows what will accidentally happen :).
- This guide is for EFI systems only.

# 2. Steps

## i. Take notes of the partitions

- Boot your Arch Installation Media.
- Connect to the internet and edit the `mirrorlist` file:
    ```bash {title="Click to expand" collapsed=true}
    $ ip link
    $ nano /etc/pacman.d/mirrorlist
    ```

- If you want to connect to a wireless network:

    ```bash
    $ wifi-menu
    ```

- Run `lsblk` to view your partition list.

    Sample output:

    ```bash
    NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
    sda      8:0    0 223.6G  0 disk
    ├─sda2   8:2    0  40.6G  0 part 
    ├─sda3   8:3    0   575M  0 part 
    └─sda4   8:4    0   512M  0 part 
    sdb      8:16   0 465.8G  0 disk 
    ├─sdb2   8:18   0    63G  0 part 
    └─sdb4   8:20   0     3G  0 part 
    sdc      8:32   1  28.9G  0 disk 
    └─sdc1   8:33   1  28.9G  0 part
    ```

- Note down the name of:
  - Your source partition (the partition having Arch installed on at the moment).
  - Your destination partition (the new partition to where you desire to transfer your Arch installation).
  - Your destination EFI partition (to where you will transfer the bootloader to, *it can either be your new or current EFI partition*).

- To avoid confusion, in this guide I will refer them as `/dev/sdX_source`, `/dev/sdX_dest` and `/dev/sdX_efi`. In the commands below, replace them with your corresponding partition names.

## ii. Transfering your Arch installation

- Format your destination partition by running `mkfs.ext4 /dev/sdX_dest`.

### a. If the capacity of your new partition is larger

- In this case, we can easily use `dd` to transfer our data.
- Remember to ***double check*** the names of your partitions before we start.
- Execute `fdisk -l /dev/sdX_source` to get the partition block size.

    Sample output:

    ```bash
    Disk /dev/sda1: 181.98 GiB, 195375923200 bytes, 381593600 sectors
    Units: sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    ```

- Note down your block size. In my case it is 512 bytes.
- Execute this command to transfer all data from `/dev/sdX_source` to `/dev/sdX_dest`. Replace `sdX_source` and `sdX_dest` with your corresponding partition names and `bs=512` with your block size.

    ```bash
    $ dd if=/dev/sdX_source of=/dev/sdX_dest bs=512 conv=notrunc,noerror,sync status=progress
    ```

- Wait until the progress completes.
- Check the new filesystem with `fsck -y /dev/sdX_dest`. The `-y` argument denotes that if there are any errors in the filesystem, they will be fixed automatically without asking.
- If you have not created a mount point for the new partition yet, create one by executing `mkdir /mnt`.
- Mount `/dev/sdX_source` to `/mnt` to see if it works.

    ```bash
    $ mount /dev/sdX_source /mnt
    ```

- If the volume mounted successfully then congratulations! If not, you might receive something like this:

    ```bash
    mount: wrong fs type, bad option, bad superblock on /dev/sdb1, 
    missing codepage or helper program, or other error.
    ```

  Reformat the destination partition with `mkfs.ext4 /dev/sdX_dest` and follow the next steps in section **b** to overcome this issue.

### b. If the capacity of your new partition is smaller

- In this case, it is likely that `dd` will fail and you will not be able to mount the new partition after having `dd`-ed it. We will perform file-level transfers to migrate the data, or in other words, copy the files one by one.
- Remember to ***double check*** the names of your partitions before we start.
- Create mount points for both `/dev/sdX_source` and `/dev/sdX_dest` if you have not done so.

    ```bash
    $ mkdir /mnt
    $ mkdir /mnt_old 
    ```

  `/mnt` will be the mount point of your new partition, while the old one will be mounted to `/mnt_old`.

- Mount the partitions

    ```bash
    $ mount /dev/sdX_source /mnt_old
    $ mount /dev/sdX_dest /mnt 
    ```

- Run the following command to copy all data from `/mnt_old` to `/mnt`

    ```bash
    $ rsync -AXa --info=progress2 /mnt_old/ /mnt
    ```

  **Be careful!** Remember to type one more `/` after `/mnt_old` or else a new folder named `mnt_old` will be created inside `/mnt`!

- Wait until the progress completes.
- Check the new filesystem with `fsck -y /dev/sdX_dest`. The `-y` argument denotes that if there are any errors in the filesystem, they will be fixed automatically without asking.

## iii. Reinstalling the bootloader

- If you have created a new EFI partition in your destination disk and no bootloader has been installed yet, remember to format it first.

    ```bash
    $ mkfs.fat /dev/sdX_efi
    ```

- If there is already a bootloader installed in the destination EFI partition (e.g. Windows Bootloader), then do not format it, or else your Windows installation won't be able to boot.
- Mount the EFI partition:

    ```bash
    $ mkdir /mnt/efi
    $ mount /dev/sdX_efi /mnt/efi
    ```

- Run `mkswap /dev/sdX_swap` and `swapon /dev/sdX_swap` if you would like to make use of the swap partition.
- Make sure that your new root `/` has been mounted to `/mnt` and the ESP has been mounted to `/mnt/efi` by executing `ls /mnt` and `ls /mnt/efi` respectively.
- Run this command to generate a new `fstab` file:

    ```bash
    $ genfstab -U /mnt > /mnt/etc/fstab
    ```

  This will create a new fstab file. All of your modifications on the old one will be lost (if there are any).

- Check the new fstab file to see whether it has been correctly created or not. Make changes if you wish to.

    ```bash
    $ nano /mnt/etc/fstab
    ```

- Chroot into /mnt:

    ```bash
    $ arch-chroot /mnt
    ```

- Generate a new initial ramdisk:

    ```bash
    $ mkinitcpio -p linux
    ```

- Reinstall the bootloader.

    ```bash
    $ pacman -Sy efibootmgr grub os-prober
    $ grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=GRUB
    $ grub-mkconfig -o /boot/grub/grub.cfg
    ```

- Reboot the system

    ```bash
    $ exit
    $ umount -a
    $ reboot
    ```