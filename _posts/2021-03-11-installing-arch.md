---
layout: post
title: Installing Arch Linux
thumbnail: "assets/img/feature-img/arch-install.png"
color: 222831
tags: [linux, howto]
excerpt_separator: <!--more-->
---

Arch Linux and its derivatives are amongst the most popular Linux distributions according to distrowatch (circa Mar 2021). You are provided with stability, flexibility and great community support by using Arch Linux.
<!--more--> 

Well, the screenshot in the header is actually from Manjaro (a derivative of Arch), because I faced some technical issues with Arch at the time I wrote this post, and I really needed a working computer so I temporarily installed Manjaro.

**Note:** this post only acts as a brief summary for people who are already familiar with the installation process, or at least has adequate experience working with the terminal interface of the GNU/Linux operating system.

# 1. Prepare
- Arch Linux installation media.
- A working computer.
- Internet connection.
- Brain.

# 2. First steps
- Plug the USB installation media into your computer and boot from it.
- If you are connecting via Ethernet, try to ping somewhere to see if your internet connection is functioning properly. Else if you are intending to use your wireless connection, do following steps:
  - Find your wireless interface name.
  ```bash
  $ iwctl device list
  ```
  Note down your device name.

  - Scan the networks.
  ```bash
  $ iwctl station <device> scan
  $ iwctl station <device> get-networks
  ```
  - Connect to your desired hotspot.
  ```bash
  $ iwctl station <device> connect <SSID>
  ```

# 3. Partition your file systems
> ⚠️ If you are unfamiliar with partitioning using command line, do it in another operating system first before continuing to avoid loss of data.

- Run the following command to list your blocks:
  ```bash
  $ lsblk
  ```
- Look at the result and note down the block name of important partitions such as ESP, root partition, etc.
  In this post I will only pay attention to my the ESP, root partition and swap partition.
  ```bash
  NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
  nvme0n1     259:0    0 476.9G  0 disk 
  ├─nvme0n1p1 259:1    0   100G  0 part 
  ├─nvme0n1p2 259:2    0   148G  0 part 
  ├─nvme0n1p3 259:3    0 224.1G  0 part 
  ├─nvme0n1p4 259:4    0   4.1G  0 part 
  └─nvme0n1p5 259:5    0   505M  0 part
  ```
  Looking at the size of each partition, I can realize that `nvme0n1p1` is my root partition, `nvme0n1p4` is my swap partition and `nvme0n1p5` is my ESP.
- If you have not partitioned your device yet, do it first by issuing

> ⚠️ Data is precious. Think twice before hitting RETURN. There is no way back.<br>
> ⚠️ Remember to replace the block name with your own.
  ```bash
  $ cgdisk /dev/nvme0n1 # replace the device name with yours
  ```
  Documentation for `cgdisk` can be found on the Internet.

- Format your partitions

> ⚠️ Data is precious. Think twice before hitting RETURN. There is no way back.<br>
> ⚠️ Remember to replace the block name with your own.
  ```bash
  $ mkfs.ext4 /dev/nvme0n1p1  # root partition
  $ mkfs.fat /dev/nvme0n1p5   # esp
  $ mkswap /dev/nvme0n1p4     # swap
  ```

- Create mountpoints and mount the file systems
  ```bash
  $ mkdir -p /mnt/efi
  $ mount /dev/nvme0n1p1 /mnt     # root partition
  $ mount /dev/nvme0n1p5 /mnt/efi # esp
  $ swapon /dev/nvme0n1p4         # swap
  ```

## 3. Pacstrap - install essential packages
- Edit your mirrorlist if needed
  ```bash
  $ pacman -Sy vim
  $ vim /etc/pacman.d/mirrorlist
  ```
  Optionally, you can run `reflector` to update the mirrorlist automatically
  ```bash
  $ pacman -Sy reflector
  $ reflector --sort rate --save /etc/pacman.d/mirrorlist
  ```
- Pacstrap essential packages
  ```bash
  $ pacstrap /mnt base base-devel linux linux-firmware linux-headers
  ```
- Generate `fstab`
  ```bash
  $ genfstab -U /mnt > /mnt/etc/fstab
  ```

## 4. Configure the new environment
- Chroot into the new environment
  ```bash
  $ arch-chroot /mnt
  $ pacman -Sy vim
  ```
- Update your local timezone and system clock
  ```bash
  $ ln -sf /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime
  $ hwclock --sys-to-hc
  ```
- Run the following command and uncomment your locale(s)
  ```bash
  $ vim /etc/locale.gen
  $ locale-gen
  ```
- Create the `locale.conf` file, and set the `LANG` variable accordingly
  ```bash
  $ echo LANG=en_US.UTF-8 > /etc/locale.conf
  ```
- Set your hostname (your computer name):
  ```bash
  $ echo thinkpad-t14 > /etc/hostname
  ```
- Create `/etc/hosts` with the following content
  ```
  127.0.0.1	localhost
  ::1		localhost
  ```
- Create a new user and set your passwords:
  ```bash
  $ passwd         # set root password
  $ useradd -g users -G wheel,storage,power -m hiraki  
  $ passwd hiraki  # replace hiraki with your username
  ```
- Edit the visudo file to allow your user to execute `sudo` command.
  ```bash
  $ pacman -Sy vim
  $ EDITOR=vim visudo
  ```
  Find an uncomment the following line
  ```bash
  %wheel ALL=(ALL) ALL
  ```
- Install a desktop environment of your choice (choose only one)
  ```bash
  $ pacman -Sy gnome gnome-extra
  $ pacman -Sy plasma kde-applications
  $ pacman -Sy xfce4 xfce4-goodies lightdm
  ```
- Activate the corresponding display manager
  ```bash
  $ systemctl enable gdm     # gnome
  $ systemctl enable sddm    # kde
  $ systemctl enable lightdm # xfce
  ```
- Install yay (an AUR helper, pacman wrapper)
  ```bash
  $ cd ~
  $ git clone https://aur.archlinux.org/yay.git
  $ cd yay
  $ makepkg -si
  ```

## 5. Configure the bootloader
- Update your CPU ucode (choose one)
  ```bash
  $ pacman -Sy amd-ucode
  $ pacman -Sy intel-ucode
  ```
- Install grub packages
  ```bash
  $ pacman -Sy grub efibootmgr os-prober
  ```
- Install GRUB and generate config file
  ```bash
  $ grub-install --target=x86_64-efi --efi-directory=/efi --bootloader-id=GRUB
  $ grub-mkconfig -o /boot/grub/grub.cfg
  ```
- Reboot your machine
  ```bash
  $ exit
  $ umount -a
  $ reboot
  ```

## 6. Post-install
- Congratulations, if things went smoothly, you are having a basic functioning Arch Linux installation now. 
- Change your shell to zsh if you wish to
  ```bash
  $ sudo pacman -Sy zsh
  $ chsh -s $(which zsh) $LOGNAME
  $ chsh -s $(which zsh) root
  ```
- Install oh-my-zsh (shell styling utility)
  ```bash
  $ sudo pacman -Sy wget
  $ sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
  ```
- Install vim and setup your plugins
  ```bash
  $ sudo pacman -S vim
  $ vim ~/.vimrc
  ....
  ```
- Link your configurations to the root user to have a consistent experience
  ```bash
  $ sudo ln -sf /home/$LOGNAME/.vimrc /root/.vimrc
  $ sudo ln -sf /home/$LOGNAME/.vim /root/.vim
  $ sudo ln -sf /home/$LOGNAME/.zshrc /root/.zshrc
  $ sudo ln -sf /home/$LOGNAME/.oh-my-zsh /root/.oh-my-zsh
  ```

<center>
Wish you enjoy the best Linux distribution in the world!
</center>





  





