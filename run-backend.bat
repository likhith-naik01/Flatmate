@echo off
echo Starting RoomMate Spring Boot Backend...
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%~dp0.maven\bin;%PATH%"
cd /d "%~dp0roommate-backend"
mvn spring-boot:run
