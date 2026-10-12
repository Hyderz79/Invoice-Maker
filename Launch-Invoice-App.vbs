Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strCurrentDir = fso.GetAbsolutePathName(".")
strHtmlPath = "file:///" & Replace(strCurrentDir & "\index.html", "\", "/")

strBrowser = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe")
If Not fso.FileExists(strBrowser) Then
    strBrowser = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Microsoft\Edge\Application\msedge.exe")
End If
If Not fso.FileExists(strBrowser) Then
    strBrowser = WshShell.ExpandEnvironmentStrings("%ProgramFiles%\Google\Chrome\Application\chrome.exe")
End If

If fso.FileExists(strBrowser) Then
    WshShell.Run """" & strBrowser & """ --app=""" & strHtmlPath & """", 1, False
Else
    WshShell.Run """" & strHtmlPath & """", 1, False
End If
