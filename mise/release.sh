#!/bin/bash

set -e

# Check if using changesets
if [ -f ".changeset/config.json" ]; then
    echo "ℹ️  This project uses changesets for releases."
    echo ""
    echo "To create a new release:"
    echo "  1. Create a changeset: npm run changeset"
    echo "  2. Push to main branch"
    echo "  3. Merge the automated PR created by changesets"
    echo ""
    echo "For manual release (not recommended), use: $0 --manual [major|minor|patch]"
    
    if [ "$1" != "--manual" ]; then
        exit 0
    fi
    shift
fi

# Set default version increment type if not provided
VERSION_TYPE="${1:-patch}"

# Validate version increment type
if [[ ! "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo "Error: Version type must be 'major', 'minor', or 'patch'"
    echo "Usage: $0 [--manual] [major|minor|patch]"
    exit 1
fi

# Change to the project root directory
cd "$(dirname "$0")/.."

# Check if git repository is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: Git repository is not clean. Please commit or stash your changes."
    git status --short
    exit 1
fi

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Error: You must be on the main branch to release. Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Run tests first - fail fast if tests don't pass
echo "Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "Error: Tests failed. Please fix the tests before releasing."
    exit 1
fi

# Run linter
echo "Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "Error: Linting failed. Please fix linting issues before releasing."
    exit 1
fi

# Build the package
echo "Building package..."
npm run build

# Read current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Calculate new version using npm version (dry-run) for preview only
NEW_VERSION=$(npm version $VERSION_TYPE --no-git-tag-version --dry-run 2>/dev/null | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+' | head -1 | sed 's/^v//')
echo "New version will be: $NEW_VERSION"

# Update version deterministically without triggering npm version lifecycle
echo "Updating version..."
npm pkg set version="$NEW_VERSION"
npm install --package-lock-only >/dev/null 2>&1 || true

# Read the actual new version from package.json
NEW_VERSION=$(node -p "require('./package.json').version")
echo "Version updated to: $NEW_VERSION"

# Ensure oclif manifest is updated
echo "Updating oclif manifest..."
npm run prepack

# Update README with oclif (this is our npm script named 'version'; not 'npm version')
echo "Updating README..."
npm run version

# Commit version bump
echo "Committing version bump..."
git add package.json package-lock.json README.md
# Add oclif.manifest.json if it exists (it may be gitignored)
if [ -f "oclif.manifest.json" ]; then
    git add oclif.manifest.json 2>/dev/null || true
fi
git commit -m "chore: release v$NEW_VERSION"

# Create git tag
echo "Creating git tag..."
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"

# Push to remote
echo "Pushing to remote..."
git push origin main
git push origin "v$NEW_VERSION"

# Ask about publishing to npm
echo ""
read -p "Publish to npm? (y/N): " publish_confirm

if [[ "$publish_confirm" =~ ^[Yy]$ ]]; then
    echo "Publishing to npm..."
    
    # Check if logged in to npm
    if ! npm whoami &> /dev/null; then
        echo "You need to be logged in to npm. Running 'npm login'..."
        npm login
    fi
    
    # Publish to npm
    if npm publish; then
        echo "✓ Package published successfully to npm"
        echo ""
        echo "View your package at: https://www.npmjs.com/package/aimapper"
        echo ""
        echo "Install globally: npm install -g aimapper"
        echo "Or use with npx: npx aimapper build"
    else
        echo "Error: npm publish failed"
        exit 1
    fi
else
    echo "Skipping npm publishing."
    echo "You can manually publish later with:"
    echo "  npm publish"
fi

echo ""
echo "🎉 Release complete!"
echo "Version $NEW_VERSION has been released."
echo ""
echo "Next steps:"
echo "- Update the changelog if you have one"
echo "- Create a GitHub release at: https://github.com/nacyot/aimapper/releases/new"
echo "- Test the published package: npx aimapper@$NEW_VERSION --help"
echo ""
echo "⚠️  Note: This was a manual release. Consider using changesets for automated releases:"
echo "  npm run changeset"
