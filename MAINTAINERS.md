# Maintainers Guide

This guide is for maintainers and core contributors to the NativeScript project.

## Table of Contents

- [Release Process](#release-process)
- [Issue Triage](#issue-triage)
- [Pull Request Review](#pull-request-review)
- [Security Issues](#security-issues)
- [Community Management](#community-management)

## Release Process

### Version Strategy

NativeScript follows [Semantic Versioning](https://semver.org/):

- **Major** (X.0.0): Breaking changes
- **Minor** (x.X.0): New features (backward compatible)
- **Patch** (x.x.X): Bug fixes (backward compatible)

### Pre-release Checklist

- [ ] All tests pass on CI
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated with all notable changes
- [ ] Breaking changes are clearly documented
- [ ] Migration guide is prepared (for major/breaking changes)
- [ ] All related packages are version-aligned

### Release Steps

1. **Update version numbers**

   ```bash
   npm version [major|minor|patch]
   ```

2. **Update CHANGELOG.md**
   - Move items from `[Unreleased]` to new version section
   - Add release date
   - Create new `[Unreleased]` section

3. **Create release branch** (for major versions)

   ```bash
   git checkout -b release/v9.x
   ```

4. **Build and test**

   ```bash
   npm run build
   npm test
   ```

5. **Create Git tag**

   ```bash
   git tag -a v9.0.0 -m "Release v9.0.0"
   git push origin v9.0.0
   ```

6. **Publish to npm**

   ```bash
   npm publish --access public
   ```

7. **Create GitHub Release**
   - Go to Releases page
   - Draft new release
   - Include changelog
   - Highlight breaking changes
   - Add migration notes

8. **Announce release**
   - Blog post
   - Twitter
   - Discord
   - Newsletter

## Issue Triage

### Priority Labels

- `priority: critical` - Security issues, data loss, crashes
- `priority: high` - Major bugs affecting many users
- `priority: medium` - Bugs with workarounds
- `priority: low` - Minor issues, cosmetic problems

### Status Labels

- `status: needs-triage` - New issues awaiting review
- `status: confirmed` - Reproduced and confirmed
- `status: blocked` - Waiting on external dependency
- `status: in-progress` - Actively being worked on
- `status: needs-info` - Waiting for more information

### Type Labels

- `type: bug` - Something isn't working
- `type: feature` - New feature request
- `type: enhancement` - Improvement to existing feature
- `type: documentation` - Documentation improvements
- `type: question` - User question

### Triage Process

1. **Initial Review** (within 48 hours)
   - Add appropriate labels
   - Ask for clarification if needed
   - Close duplicates
   - Close invalid/spam issues

2. **Validation**
   - Attempt to reproduce
   - Verify environment details
   - Check for existing fixes

3. **Assignment**
   - Assign to appropriate team member
   - Add to milestone if planned
   - Link related issues

4. **Stale Issues**
   - Issues with no activity for 30 days: add `status: stale`
   - Issues with no activity for 60 days: close with explanation

## Pull Request Review

### Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Commit messages follow guidelines
- [ ] No merge conflicts
- [ ] CI checks pass
- [ ] Breaking changes are documented
- [ ] Security implications are considered

### Review Process

1. **Initial Review** (within 3 business days)
   - Check PR description completeness
   - Verify linked issue exists
   - Run automated checks

2. **Code Review**
   - Review logic and implementation
   - Check for edge cases
   - Verify test coverage
   - Suggest improvements

3. **Testing**
   - Pull and test locally
   - Test on multiple platforms if applicable
   - Verify bug fix or feature works

4. **Approval and Merge**
   - Require at least 1 approval from core team
   - Require 2 approvals for breaking changes
   - Use "Squash and merge" for feature branches
   - Use "Rebase and merge" for clean histories

### Feedback Guidelines

- Be respectful and constructive
- Explain the "why" behind suggestions
- Provide examples when possible
- Use conventional comment prefixes:
  - `nit:` - Minor/stylistic suggestion
  - `question:` - Seeking clarification
  - `suggestion:` - Optional improvement
  - `issue:` - Must be addressed

## Security Issues

### Handling Security Reports

1. **Acknowledge receipt** within 24 hours
2. **Assess severity** using CVSS scoring
3. **Develop fix** in private repository
4. **Coordinate disclosure** with reporter
5. **Prepare advisory** for GitHub Security
6. **Release fix** with security patch version
7. **Publish advisory** after fix is available

### Security Disclosure Timeline

- **Day 0**: Report received
- **Day 1**: Acknowledgment sent
- **Day 7**: Initial assessment complete
- **Day 30**: Fix developed and tested
- **Day 60**: Coordinated public disclosure
- **Day 90**: Maximum disclosure timeline

## Community Management

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time community support
- **Stack Overflow**: Technical Q&A
- **Twitter**: Announcements and engagement
- **Blog**: Long-form updates and tutorials

### Code of Conduct Enforcement

1. **Warning**: First violation - private warning
2. **Temporary Ban**: Repeated violations - 7-day ban
3. **Permanent Ban**: Serious or continued violations

### Community Recognition

- Acknowledge contributors in release notes
- Feature community projects in blog
- Highlight helpful community members
- Maintain contributors list

## Best Practices

### Documentation

- Keep docs in sync with code
- Include examples for new features
- Update migration guides
- Review docs with each PR

### Testing

- Maintain >80% code coverage
- Test on multiple platforms
- Include integration tests
- Run performance benchmarks

### Deprecation Policy

1. **Announce deprecation** in version N
2. **Show warnings** in version N+1
3. **Remove feature** in version N+2 (major release)

### Backward Compatibility

- Maintain for at least 2 major versions
- Provide clear migration paths
- Support LTS versions

## Tools and Automation

### CI/CD

- GitHub Actions for testing
- Automated npm publishing
- Dependency updates via Dependabot
- Security scanning

### Bots and Automation

- Stale issue management
- PR size labeling
- Welcome messages for new contributors
- Automated changelog generation

## Resources

- [Internal Developer Guide](tools/notes/DevelopmentWorkflow.md)
- [Coding Conventions](tools/notes/CodingConvention.md)
- [Writing Tests](tools/notes/WritingUnitTests.md)
- [Error Handling](tools/notes/HandlingErrors.md)

## Questions?

For maintainer-specific questions, contact the core team via:

- Email: <oss@nativescript.org>
- Private Discord channel

---

Thank you for your dedication to maintaining NativeScript! 🎉
