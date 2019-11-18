# Cordova 개발환경 세팅 

## 사전 설치
- NodeJS  https://nodejs.org/ko/download/
- Git https://git-scm.com/
- JDK 8 https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
- Android Studio (Android SDK) https://developer.android.com/studio/index.html?#downloads
  
  OS버전에 맞게 설치

- Gradle https://gradle.org/releases/ 

  최신버전의 complete 다운 후 압축 풀기


## 환경변수 등록
1. 제어판 > 시스템 > 고급 시스템 설정 > 고급 > 환경 변수 > 시스템 변수
2. 새로 만들기
  - 변수이름: JAVA_HOME   
  - 변수 값: 자바JDK 설치 경로 
    - ex) C:\Program Files\Java\jdk1.8.0_221
  
  
  - 변수이름: ANDROID_HOME   
  - 변수 값: 안드로이드 SDK 설치 경로 (Android studio > Android SDK Location에서 확인 가능)
    - Ex) C:\Users\jang2\AppData\Local\Android\Sdk  


3. Path 선택 후 편집 클릭 후 아래 경로 추가
  - %ANDROID_HOME%\platform-tools
  - %ANDROID_HOME%\tools
  - %JAVA_HOME%\bin
  - (Gradle 설치 경로)\bin
  Ex) C:\Gradle\gradle-5.6\bin
  (Path 값이 여러 줄로 안보이고 한 줄로 보이면 ;로 구분하며 추가)


## Cordova 설치
cmd창에 명령어 “npm install -g cordova” 실행


## 프로젝트 설치
cmd창에 명령어 “git clone https://github.com/openthingsaz/-cat_wheel_ble_app.git” 실행


## 모듈 설치 및 빌드
프로젝트 폴더 위치에서 아래 명령어 순서대로 실행
-	npm install 
-	npm run build
-	cordova add platform android
-	cordova build android


## APK 설치
(프로젝트폴더)\platforms\android\app\build\outputs\apk\debug\app-debug.apk 파일 설치
