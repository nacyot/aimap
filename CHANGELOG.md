# aimapper

## 0.2.0

### Minor Changes

- feat: Enhanced clean command and improved build process

  - **Clean command improvements**: Added separate `--all` and `--hash` flags for better control

    - `--all` flag now cleans all agents regardless of config
    - New `--hash` flag specifically for removing build hash file
    - Improved verbose logging for better clarity

  - **Clean-before-build implementation**: Prevents orphaned files when rebuilding

    - Automatically cleans existing outputs before building each agent
    - Solves the issue where old files like '99-old-rule.mdc' would remain after rebuild
    - Gracefully handles clean errors when files don't exist

  - **Release workflow**: Added comprehensive release script

    - Supports both changesets and manual releases
    - Includes test, lint, and build validation
    - Integrated with mise task runner

  - **Package improvements**:

    - Reduced Node.js requirement from >=22.18.0 to >=18.0.0 for wider compatibility
    - Removed unused `execa` dependency
    - Excluded development files from npm package

  - **Testing**: Added comprehensive test coverage for new features
