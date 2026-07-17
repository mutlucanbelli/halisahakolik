if (Test-Path publish) { Remove-Item -Recurse -Force publish }
New-Item -ItemType Directory -Path publish | Out-Null
Copy-Item -Recurse -Force .\.next\standalone\* .\publish\
Copy-Item -Recurse -Force .\public .\publish\public
Copy-Item -Recurse -Force .\.next\static .\publish\.next\static
Copy-Item -Force .\dev.db .\publish\
Copy-Item -Force .\.env .\publish\
Copy-Item -Force .\web.config .\publish\
New-Item -ItemType File -Path .\publish\start.bat -Value "node server.js" | Out-Null
Compress-Archive -Path .\publish\* -DestinationPath .\publish.zip -Force
