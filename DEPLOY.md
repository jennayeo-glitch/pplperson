# GitHub Pages 배포 가이드

## 1. GitHub 저장소 생성

1. GitHub에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository"
3. Repository name: `ppl_person` (또는 원하는 이름)
4. Public 또는 Private 선택
5. "Create repository" 클릭

## 2. 로컬에서 Git 초기화 및 푸시

터미널에서 다음 명령어를 실행하세요:

```bash
# Git 저장소 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: ppl person landing page"

# GitHub 저장소 연결 (YOUR_USERNAME을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/ppl_person.git

# main 브랜치로 푸시
git branch -M main
git push -u origin main
```

## 3. GitHub Pages 설정

### 방법 1: GitHub Actions 사용 (권장)

1. GitHub 저장소 페이지로 이동
2. Settings > Pages 클릭
3. Source에서 "GitHub Actions" 선택
4. 아래의 `.github/workflows/deploy.yml` 파일을 생성하세요

### 방법 2: 빌드 후 dist 폴더 푸시

```bash
# 프로덕션 빌드
npm run build

# dist 폴더를 docs 폴더로 복사 (GitHub Pages는 /docs 또는 /root 사용)
cp -r dist docs

# docs 폴더 추가 및 푸시
git add docs
git commit -m "Add build files for GitHub Pages"
git push
```

그 다음 GitHub 저장소의 Settings > Pages에서:
- Source: "Deploy from a branch" 선택
- Branch: "main" 선택
- Folder: "/docs" 선택
- Save 클릭

## 4. 배포 확인

몇 분 후 `https://YOUR_USERNAME.github.io/ppl_person/` 주소로 접속하면 사이트가 배포됩니다.

## 주의사항

- 카카오 로그인은 카카오 개발자 콘솔에서 배포된 도메인을 등록해야 합니다
- 이미지 경로가 상대 경로로 설정되어 있어야 합니다 (vite.config.js에서 base: './' 설정 완료)

