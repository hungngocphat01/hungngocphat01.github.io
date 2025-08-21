+++
date = '2019-12-03T15:04:50+07:00'
title = 'Patching the root-checking mechanism of Love Live! SIFAS'
tags = ['guide']
featuredImage = "cover.jpg"
summary = "Guide of decompling and patching the root-checking mechanism of SIFAS to be able to play on PC"
+++

{{< admonition type=warning title="Deprecation" open=true >}}
In the February 2020 update, KLab now checks for the integrity of the SIFAS application everytime the game starts. This workaround is now useless.
{{< /admonition >}}

To play LLAS with keybindings on Android-x86, root access is required. However, LLAS has a built-in root checker that will prevent you from starting the game if your device is rooted. So the most important thing we need to do would be disabling that root checker.


## Section 1: Installing Android-x86

Installing it on your own.

## Section 2: Make your own rootchecker-less version of LLAS

{{< admonition type=danger title="Disclaimer" open=true >}}
I'm not responsible for bricked devices, dead SD cards, thermonuclear war, or you getting fired because the alarm app failed (like it did for me...).

YOU are choosing to make these modifications, and if you point the finger at me for messing up your device, I will laugh at you.

Your warranty will be void if you tamper with any part of your device / software.
{{< /admonition >}}


If you have already had a patched APK of LLAS working properly on rooted devices, or somehow you managed to get LLAS working without unrooting Android x86, you can skip this section.


{{< admonition type=note title="Note" open=true >}}
You do not have to follow exactly the steps in this guide. From your own experience, you can alter the steps a little bit for your convenience. For instance, using APK Editor right on Android x86 instead of editing the APK in Windows.
{{< /admonition >}}


### 2.1. Tools
* Lastest Java and Java SE Development Kit.
* [APK Easy Tool (Download the lastest beta version).](https://forum.xda-developers.com/android/software-hacking/tool-apk-easy-tool-v1-02-windows-gui-t3333960)
* LLAS APKs bundle.
	* Install Qooapp and download LLAS on your Android PC but don't install it yet.	 
	* If Qooapp isn't working on your Android PC, use another Android device to download LLAS with the same steps. Next, navigate to `/sdcard/Android/data/com.qooapp.qoohelper/files/Download/` and grab all LLAS APK files.

### 2.2. Steps
#### a. Decompile the APK
1. Boot to Windows, copy and extract the LLAS APKs bundle to somewhere on your computer, as well as the APK Easy Tool (preferred as *AET* from now on).
2. Run AET (`apkeasytool.exe`), then drag the main APK (the one with the longest filename) of LLAS into AET.
	![AET Main](Images/1-AET-Main-Menu.png)

3. Click `Decompile`. Wait until the decompiling process finishes. 
The decompiled APK folder will be located in `\path_to_extracted_AET\1 - Decompiled APKs`. 
You can click `Decompiled APK Directory` under the `Decompile` button to open this directory. 
	![AET Decompiled Folder](Images/2-Decompiled-Folder.png)

#### b. Remove rootchecker command
1. Navigate to `...\1 - Decompiles APKs\com.klab.lovelive.allstars_x.x.x_...\smali\com\klab\jackpot`
2. Open the file called `JackpotActivityCallback.smali` with your favourite text editor.
3. Search for the following string: ***if-eqz v0, :cond_2***
4. Replace the whole line with: ***goto :cond_2***
	![Replacing if-eqz with goto](Images/3-ChangeSmaliCommand.png)
	

{{< admonition type=note title="Advanced explanation" open=true >}}
The above root-checkeing code is written in Smali, a low-level programming language for the Dalvik virtual machine (which works with Dalvik virtual CPU instructions and virtual registers). Its syntax is highly identical to that of the MIPS Assembly language. The overall steps of the aforementioned segment is as follow (written in C-like pseudo code).
```c
// The virtual register used in the aforementioned segment
register v0;

// Invoke a method to check for su binary presence and store it in v0
v0 = CheckSuBinaryPresence();

// If v0 equals 0 (which means no su binary), the game will jump to the :cond2 label, which is the beginning of the code segment which will actually start the game. 
if (v0 == 0) {
	goto :cond2;
}
else {
	// Or else (su binary exists), the game will stop and print an error message
}
```

After changing the code, we removed the conditional block. Now the game would jump to `:cond2` regardless the presence of su binary.

{{< /admonition >}}

5. Save the file.

#### c. Recompiling the APK
1. Go back to AET. 
2. In the *Sign* section, tick `"ZipAlign after compile"` and `"Sign after compile"`
	![ZipAlign and Sign](Images/4-AET-Select-Sign-Zipalign.png)

3. Click `Compile`. Wait until the process finishes.
The compiled APK will be written to `\path_to_extracted_AET\2 - Recompiled APKs`.
There will be 2 APKs. Only the file with `"Zipaligned"` at the end of its name is needed. Just delete the other one.
	![Recompiled ZipAlign](Images/5-RecompiledFolder.png)

#### d. Install the original version of LLAS first

* **In Android-x86, install LLAS normally from Qooapp. If you are unable do so, follow all of the steps below.**

* ***If you can install LLAS normally from Qooapp, you can skip steps from 4 to 7. But it is highly recommended that you should read them as well to know which files we will need to work on.***

1. Copy the final APK in the previous step to the directory where you extracted your LLAS bundle from the beginning.
	![DeleteOriginalAPK](Images/6-DeleteOriginal.png)

3. Copy this folder to somewhere accessible by Android-x86. You can compress and upload it to Google Drive, then download and extract it again from Android-x86.
{{< admonition type=info title="Note" open=true >}}
Installing the patched APK directly with Split APK Installer won't work
{{< /admonition >}}

4. In Android-x86, install *Split APK Installer* from Play Store (I will use my Redmi 5 Plus to demonstrate this process).
5. Open Split APK Installer, tap on *Install APKs*.
	![SAIFromPlayStore](Images/7-SAIPlayStore.jpg)
	![SAIMainScreen](Images/8-SaiMainMenu.jpg)

6. Navigate to the folder where you placed all LLAS APKs. Select the **original/old main APK**, then **other minor APKs**, but **NOT** the patched main APK. In other words, we are installing the **original version** of LLAS. Then tap *Select (4)* at the bottom corner of the screen.
	![SelectAllAPKs](Images/9-SelectAllAPKs.jpg)

7. Wait for the installation to complete.

#### e. Replace the original LLAS file with the patched one

1. Open a root file explorer. Copy your **patched main APK** to `/data/app/com.klab.lovelive.allstars.../`.
2. In `/data/app/com.klab.lovelive.allstars.../`, delete `base.apk`. Rename your newly copied APK to `base.apk`. Do a `chmod 644` on it.
3. Congrats, you have been able to create your own rootchecker-less version of LLAS and install it on your device!

## Section 3: Key-bindings

Updating (never).
