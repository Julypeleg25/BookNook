param(
  [switch]$Execute
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)

  & git @Args
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Args -join ' ') failed"
  }
}

function Assert-NoDuplicateFiles {
  param([array]$Groups)

  $seen = @{}
  foreach ($group in $Groups) {
    foreach ($file in $group.Files) {
      if ($seen.ContainsKey($file)) {
        throw "File '$file' appears in both '$($seen[$file])' and '$($group.Branch)'. Files must not be split across commits."
      }

      $seen[$file] = $group.Branch
    }
  }
}

function Assert-FilesExist {
  param([string[]]$Files)

  foreach ($file in $Files) {
    if (-not (Test-Path -LiteralPath $file)) {
      throw "Expected file '$file' does not exist."
    }
  }
}

function Switch-ToStackBranch {
  param([string]$Branch)

  $currentBranch = (& git branch --show-current).Trim()
  if ($currentBranch -eq $Branch) {
    Write-Host "Already on branch '$Branch'."
    return
  }

  & git show-ref --verify --quiet "refs/heads/$Branch"
  if ($LASTEXITCODE -eq 0) {
    throw "Branch '$Branch' already exists. Switch to it manually or rename/remove it before running this script."
  }

  Invoke-Git switch -c $Branch
}

function New-BranchCommit {
  param(
    [string]$Branch,
    [string]$Message,
    [string[]]$Files
  )

  Write-Host ""
  Write-Host "==> $Branch"
  Write-Host "Commit: $Message"
  $Files | ForEach-Object { Write-Host "  $_" }

  if (-not $Execute) {
    return
  }

  Switch-ToStackBranch -Branch $Branch

  foreach ($file in $Files) {
    Invoke-Git add -- $file
  }

  & git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) {
    throw "No staged changes for '$Branch'. Check that the working tree contains the expected edits."
  }

  Invoke-Git commit -m $Message
}

$groups = @(
  [pscustomobject]@{
    Branch = "state-cache-and-types"
    Message = "Centralize frontend cache keys and shared types"
    Files = @(
      "frontend/src/api/apiError.ts",
      "frontend/src/api/queryCache.ts",
      "frontend/src/api/queryKeys.ts",
      "frontend/src/api/services/ListsService.ts",
      "frontend/src/api/services/userService.ts",
      "frontend/src/components/auth/AuthInitializer.tsx",
      "frontend/src/components/bookCards/post/CommentsSection.tsx",
      "frontend/src/hooks/useAuth.tsx",
      "frontend/src/hooks/usePostActions.ts",
      "frontend/src/hooks/useRag.ts",
      "frontend/src/hooks/useUserApi.tsx",
      "frontend/src/models/List.ts",
      "frontend/src/models/PostForm.ts",
      "frontend/src/models/ProfileForm.ts",
      "frontend/src/models/User.ts",
      "frontend/src/models/UserReview.ts",
      "frontend/src/utils/bookUtils.ts",
      "frontend/src/utils/commentUtils.ts",
      "frontend/src/utils/reviewUtils.ts",
      "scripts/create-commit-stack.ps1"
    )
  },
  [pscustomobject]@{
    Branch = "profile-posts-and-social-state"
    Message = "Keep profile, posts, likes, and comments in sync"
    Files = @(
      "frontend/src/components/bookCards/MyBookPostCard.tsx",
      "frontend/src/components/bookCards/post/BookPostCardActions.tsx",
      "frontend/src/components/bookHeaders/BookPostHeader.tsx",
      "frontend/src/components/post/comments/CommentsHeader.tsx",
      "frontend/src/components/post/comments/CommentsSection.tsx",
      "frontend/src/components/profile/AvatarField.tsx",
      "frontend/src/components/profile/NameField.tsx",
      "frontend/src/components/profile/ProfileForm.tsx",
      "frontend/src/components/profile/UsernameField.tsx",
      "frontend/src/pages/BookPost.tsx",
      "frontend/src/pages/MyPosts.tsx",
      "frontend/src/pages/NewPost.tsx"
    )
  },
  [pscustomobject]@{
    Branch = "lists-search-and-layout-polish"
    Message = "Polish lists, search reset, and post layouts"
    Files = @(
      "frontend/src/components/bookCards/BookActionsMenu.tsx",
      "frontend/src/components/bookCards/BookInfoActions.tsx",
      "frontend/src/components/bookCards/FullBookPostCard.tsx",
      "frontend/src/components/bookHeaders/BookHeaderButtons.tsx",
      "frontend/src/components/lists/BooksList.tsx",
      "frontend/src/components/post/BookInfoSection.tsx",
      "frontend/src/components/search/SearchBooks.tsx",
      "frontend/src/components/search/SearchHeader.tsx",
      "frontend/src/components/search/SearchPosts.tsx",
      "frontend/src/components/searchFilters/SearchBar.tsx",
      "frontend/src/hooks/useSearchParamsState.ts",
      "frontend/src/pages/MyLists.tsx"
    )
  }
)

Assert-NoDuplicateFiles -Groups $groups
$groups | ForEach-Object { Assert-FilesExist -Files $_.Files }

Write-Host "Branch stack plan:"
Write-Host "1. state-cache-and-types"
Write-Host "2. profile-posts-and-social-state (from state-cache-and-types)"
Write-Host "3. lists-search-and-layout-polish (from profile-posts-and-social-state)"

foreach ($group in $groups) {
  New-BranchCommit -Branch $group.Branch -Message $group.Message -Files $group.Files
}

if (-not $Execute) {
  Write-Host ""
  Write-Host "Dry run only. Re-run with -Execute to create branches and commits."
  exit 0
}

Write-Host ""
Write-Host "Done. Remaining uncommitted files, if any:"
Invoke-Git status --short
