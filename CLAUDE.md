# Claude Code Instructions

## Git Workflow - Use Graphite

This project uses Graphite for branch management and stacked PRs. **Always use `gt` commands instead of raw `git` commands for branch operations.**

### Key Graphite Commands

- `gt create <branch-name> -m "commit message"` - Create a new branch with a commit
- `gt modify -m "message"` - Amend the current branch's commit
- `gt submit` - Submit the current branch as a PR
- `gt submit --stack` - Submit the entire stack of PRs
- `gt sync` - Sync with remote and restack branches
- `gt checkout <branch>` - Switch to a branch
- `gt trunk` - Switch to the trunk branch
- `gt log` - View the current stack
- `gt branch` - List all branches in the stack

### Stacking Workflow

When implementing features that can be broken into logical pieces:

1. Start from trunk: `gt trunk`
2. Create first branch: `gt create feature-part-1 -m "Add first part"`
3. Stack on top: `gt create feature-part-2 -m "Add second part"`
4. Submit the stack: `gt submit --stack`

### When NOT to use Graphite

- For simple status checks, use `git status` or `git log`
- For viewing diffs, use `git diff`
- Graphite is primarily for branch creation, management, and PR submission
