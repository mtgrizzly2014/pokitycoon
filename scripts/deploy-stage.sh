#!/usr/bin/env bash

# GITHUB_REF="refs/heads/master"
# GITHUB_SHA="a35d858f1d8e615ca85249ce5da69240"

echo "--- Deploying to staging ---"
echo "pwd: ${PWD}"
echo "ref: $GITHUB_REF"
echo "sha: $GITHUB_SHA"

branch=$(basename "${GITHUB_REF}")
echo "branch: $branch"

short_sha=$(echo $GITHUB_SHA | cut -c 1-7)
echo "short_sha: $short_sha"
release_id="${branch}-${short_sha}"
echo "release_id: $release_id"

echo "--- Creating deployment directory ---"
path="$GITHUB_WORKSPACE/stage/releases/$release_id"
echo "path: $path"
mkdir -p "$path"

echo "--- Copying game files ---"
rsync -avr --exclude-from='branch/scripts/deploy-exclude.txt' branch/ "$path"

echo "--- Update RELEASE.md ---"
release_file="stage/RELEASE.md"
release_url="https://trees-and-airlines.github.io/releases/${release_id}/"
commit_url="https://github.com/trees-and-airlines/pokitycoon/commit/${GITHUB_SHA}"
release_line="* $(date -u) [[${release_id}](${release_url})] [[commit](${commit_url})]"
touch "$release_file"
echo "${release_line}" | cat - "${release_file}" > temp_file && mv temp_file "${release_file}"

echo "--- Push deployment ---"
cd "$GITHUB_WORKSPACE/stage"
git config --global user.email "Stage Deploy Action"
git config --global user.name "GitHub Actions"
git add .
git status
git commit -m "staging deployment ${release_id}"
git push
