# Contributing Guide

Thank you for your interest in contributing to DreamBuildDrive 2.0!

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dreambuild-drive.git
   cd dreambuild-drive
   ```
3. **Set up development environment**
   - Follow the [Development Guide](./DEVELOPMENT.md)
4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Before You Start

- Check existing issues and PRs
- Discuss major changes in an issue first
- Ensure the feature aligns with project goals

### 2. Making Changes

#### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

**TypeScript Guidelines:**
- Use strict typing
- Avoid `any` unless absolutely necessary
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Document complex types

**Naming Conventions:**
- PascalCase for classes, interfaces, types
- camelCase for variables, functions
- UPPER_SNAKE_CASE for constants
- kebab-case for file names

#### Component Structure

**Backend (NestJS):**
```
module-name/
├── dto/
│   ├── create-module.dto.ts
│   └── update-module.dto.ts
├── entities/
│   └── module.entity.ts
├── module.controller.ts
├── module.service.ts
├── module.module.ts
└── module.controller.spec.ts
```

**Frontend (React):**
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.test.tsx
└── index.ts
```

#### Writing Tests

**Backend Tests:**
```typescript
describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProjectsService],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should create a project', async () => {
    const result = await service.create(tenantId, createDto);
    expect(result).toBeDefined();
    expect(result.name).toBe(createDto.name);
  });
});
```

**Frontend Tests:**
```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

**Test Coverage:**
- Aim for >80% coverage
- Test edge cases
- Test error handling
- Test multi-tenant scenarios

### 3. Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**
```
feat(projects): add project duplication feature

Add ability to duplicate existing projects with all categories and parts.
Useful for creating similar builds.

Closes #123
```

```
fix(auth): prevent tenant cross-access

Fixed bug where users could access other tenants' data
through direct API calls.

BREAKING CHANGE: All API endpoints now require tenantId in request context
```

### 4. Pull Request Process

#### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

#### Submitting PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what and why
   - Include screenshots for UI changes
   - Add testing instructions

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests added
- [ ] All tests pass
```

#### Review Process

- Maintainers will review within 48-72 hours
- Address feedback constructively
- Make requested changes in new commits
- Squash commits before merge (if requested)

### 5. After Merge

- Delete your feature branch
- Pull latest main
- Celebrate! 🎉

## Areas for Contribution

### High Priority

- 🐛 Bug fixes
- 📝 Documentation improvements
- ✨ Feature implementations from issues
- 🧪 Test coverage improvements

### Feature Ideas

- Advanced analytics and reporting
- Parts catalog integrations
- Mobile app
- Public build pages
- Build timeline visualization
- Cost forecasting
- Parts price tracking
- Vendor management
- Build templates
- Community features

### Documentation

- Improve README
- Add code examples
- Create tutorials
- Improve API docs
- Add architecture diagrams

## Reporting Bugs

**Before Reporting:**
1. Check existing issues
2. Verify it's reproducible
3. Check if it's fixed in main

**Bug Report Template:**
```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g. macOS 13]
- Browser: [e.g. Chrome 119]
- Node version: [e.g. 18.17.0]
- Version: [e.g. 2.0.0]

## Additional Context
Any other information
```

## Feature Requests

**Feature Request Template:**
```markdown
## Feature Description
Clear description of the feature

## Problem It Solves
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Screenshots, mockups, examples
```

## Code Review Guidelines

### As a Reviewer

- Be respectful and constructive
- Explain reasoning
- Suggest alternatives
- Approve when ready
- Request changes if needed

### As an Author

- Respond to all comments
- Ask for clarification
- Make requested changes
- Thank reviewers

## Questions?

- Check [Documentation](./DEVELOPMENT.md)
- Open an issue for discussion
- Ask in community channels

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to DreamBuildDrive! 🚗🔧
