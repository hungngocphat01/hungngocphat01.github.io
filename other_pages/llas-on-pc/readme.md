# An overview guide to playing LLAS on PC with Android-x86

![Cover](/Images/cover.jpg)
This image is owned by KLab.

## Note: This guide has not been finished writing.

## Section 1: Installing Android-x86

Updating

## Section 2: Make your own root-checker-less version of LLAS

**If you have a patched APK of LLAS working properly on rooted devices, or somehow you can make LLAS to work properly on Android-x86 without un-rooting, you can skip all steps in this section.**

To play LLAS with key-binding on Android-x86, root access is required. However, LLAS has a built-in root-checker that prevents you from entering the game if your device has root access enabled.
So firstly, we have to disable that root-checker.

***Note: You do not have to follow exactly what this guide tells you. From your own knowledge, you can follow the main idea of this guide and do it in another way, for example, with APK Editor right on Android-x86.***

### 2.1. Tools
* Lastest Java and Java SE Development Kit.
* [APK Easy Tool (Download the lastest beta version).](https://forum.xda-developers.com/android/software-hacking/tool-apk-easy-tool-v1-02-windows-gui-t3333960)
* LLAS APKs bundle.
	* Grab another Android device. Open Qooapp, download LLAS, but do not install it yet. Navigate to */sdcard/Android/data/com.qooapp.qoohelper/files/Download/* and grab all LLAS APK files. (safe, recommended)
	* You can also get one on apkplz.net (not safe, not recommended, but easier).

### 2.2. Steps
#### a. Decompile the APK
1. Extract the LLAS APKs bundle to somewhere on your computer, as well as the APK Easy Tool (preferred as *AET* from now on).
2. Run AET (*apkeasytool.exe*), then drag-n-drop the main APK (the one with longest filename) of LLAS into AET.

![AET Main](Images/1-AET-Main-Menu.png)

3. Click on "Decompile". Wait until the decompiling process finishes.
The decompiled APK folder will be located in *\path_to_extracted_AET\1 - Decompiled APKs*.
You can click on *Decompiled APK Directory* under the *Decompile* button to open this directory.

![AET Decompiled Folder](Images/2-Decompiled-Folder.png)

#### b. Remove root-checking command
1. Navigate to *...\1 - Decompiles APKs\com.klab.lovelive.allstars_x.x.x_...\smali\com\klab\jackpot*
2. Open the file named *JackpotActivityCallback.smali* with your favourite text editor (Notepad++ is highly recommended).
3. Search for the following string: ***if-eqz v0, :cond_2***
4. Replace it with: ***goto :cond_2***

![Replacing if-eqz with goto](Images/3-ChangeSmaliCommand.png)

* **Advanced note**: The above piece of code is written in Smali, a low level programming language for Dalvik virtual machine. It is a little bit similar to Assembly. The overall idea of the above piece of code is:
	* Invoke a method to check if your device has root access or not. Save the result to register *v0*.
	* If *v0 = 0*, then your device has no root access. The program will jump to label *:cond_2*, which is just before *return-void*. The game will continue starting.
	* Otherwise (your device have root access, register v0 != 0), it will execute a bunch of other lines of code, preventing the game from starting.
	* We have just removed the conditional jump of the root checking process. The game will jump to *:cond_2* whether your device has root access or not. So the game will always start normally.


5. Save the file. You are done.

#### c. Recompiling the APK
1. Go back to AET. 
2. Under *Sign* section, tick *"ZipAlign after compile"* and *"Sign after compile"*

![ZipAlign and Sign](Images/4-AET-Select-Sign-Zipalign.png)

3. Click *Compile*. Wait until the process finishes.
The compiled APK will be located in *\path_to_extracted_AET\2 - Recompiled APKs*.
There will be 2 APKs. We just need the one with *"Zipaligned"* at the end of its filename. Delete the other one.

![Recompiled ZipAlign](Images/5-RecompiledFolder.png)

#### d. Install the original version of LLAS first

* **In Android-x86, install LLAS normally from Qooapp. If you cannot do so, do all of below steps.**

* ***If you can install LLAS normally from Qooapp, you can skip steps from 4 to 7. But it is highly recommended that you should read them as well to acknowledge which files we will work on.***

1. Copy the remaining APK in the previous step to the directory where you extracted your LLAS bundle at the beginning.

![DeleteOriginalAPK](Images/6-DeleteOriginal.png)

3. Copy this folder to somewhere which is accessible from Android-x86. You can compress and upload it to Google Drive, then download and extract it again from Android-x86.

***Below process is rather advanced. You should not perform it unless you are familiar with browsing Android system files.***
***Note: Installing the patched APK directly with Split APK Installer won't work.***

4. In Android-x86, install *Split APK Installer* from Play Store (I will use my Redmi 5 Plus to demonstrate this process).
5. Open Split APK Installer, tap on *Install APKs*.

![SAIFromPlayStore](Images/7-SAIPlayStore.jpg)
![SAIMainScreen](Images/8-SaiMainMenu.jpg)

6. Navigate to the folder where you placed all the APKs of LLAS. Select the **original/old main APK**, then the **other minor APKs**, but **NOT** the patched main APK. In other words, we are installing the **original version** of LLAS. Then tap *Select (4)* at the bottom corner of the screen.

![SelectAllAPKs](Images/9-SelectAllAPKs.jpg)

7. Wait for the installation to complete.

#### e. Replace original LLAS file with patched one

1. Open a root explorer. Copy your **patched main APK** to */data/app/com.klab.lovelive.allstars.../*
2. In */data/app/com.klab.lovelive.allstars.../*, delete *base.apk*. Rename your newly copied APK to *base.apk*. *Chmod 644* it.
3. You are done. But we have not finished yet.

## Section 3: Key-bindings

Updating
