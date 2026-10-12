Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")

' Path to current directory and index.html
Set fso = CreateObject("Scripting.FileSystemObject")
strCurrentDir = fso.GetAbsolutePathName(".")
strHtmlPath = "file:///" & Replace(strCurrentDir & "\index.html", "\", "/")
strIconPath = strCurrentDir & "\app-icon.ico"

' Locate Edge or Chrome
strBrowser = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe")
If Not fso.FileExists(strBrowser) Then
    strBrowser = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe")
End If
If Not fso.FileExists(strBrowser) Then
    strBrowser = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe")
End If

Set oShortcut = WshShell.CreateShortcut(strDesktop & "\Invoice Studio.lnk")
oShortcut.TargetPath = strBrowser
oShortcut.Arguments = "--app=""" & strHtmlPath & """"
oShortcut.WorkingDirectory = strCurrentDir
oShortcut.IconLocation = strIconPath & ", 0"
oShortcut.Description = "Invoice Studio (Offline App)"
oShortcut.Save

WScript.Echo "Desktop shortcut created successfully at: " & strDesktop & "\Invoice Studio.lnk"
