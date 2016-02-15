#Working with source control

As a reference point, you might find it useful to check the following [Git tutorial](http://rogerdudler.github.io/git-guide/) and the [Git cheatsheet] (http://www.git-tower.com/files/cheatsheet/Git_Cheat_Sheet_grey.pdf).

***
### (!) Important - Before you start
1.<a id="global-rebase"></a>`git config --global branch.autosetuprebase always` will make `git pull` to use `--rebase`. (shall works with TortoiseGit as well.)

2.<a id="push-upstream"></a>`git config --global push.default upstream` make `git push --force` to work with upstream of current branch only.

***

When working on a new feature/enhancement, or fixing a bug, every team member should use a separate feature branch. In order to make it easy to differentiate between member branches you should prefix its name with your user name - I.e. such name will look like this **dvarchev/Cordova-mocks-update**. In order to separate different words in branch name use dashes instead of spaces.

## Create a new feature branch
In order to create a new branch simply run the following **git checkout -b <branch-name>** command.

`git checkout -b dvarchev/Cordova-mocks-update`

If you are currently on another branch (not master) you need to append **master** at the end. This will create the new branch out of the master and not your current one.

`git checkout -b dvarchev/Cordova-mocks-update master`

## Publishing a feature branch to origin
When working on a separate branch you would usually push it to GitHub. You can use the **git push -u origin <branch-name>** command for that.

`git push -u origin dvarchev/Cordova-mocks-update` 

If you want to have a shorter name for your branch locally and the verbose name only on the server branch, here is how you create and push the branch to the server (local name "mocks", server name "dvarchev/Cordova-mocks-update")

```bash
git checkout -b mocks
git push -u origin mocks:dvarchev/Cordova-mocks-update
```

This way you will easily switch branches locally and on the server their name will be properly descriptive.

## Get someone else's branch locally

If you need to start working on someone else's branch, you can set it up locally as follows (the remote branch is again called "dvarchev/Cordova-mocks-update" and you will map it to a local branch called "mocks"):

```bash
git checkout -b mocks origin/dvarchev/Cordova-mocks-update
```

Your upstream will be set automatically and you shouldn't worry where your local branch is pointing to.

## Updating a feature branch with latest changes from master
While working on a feature branch you need to regularly update with the latest changes from the master branch. You should do that using the fetch & rebase commands.  

```bash
git fetch     
git rebase origin/master
```

You can also switch to your master, pull latest changes and rebase your feature branch. This way you'll have both your local master and local feature branch up to date.

```bash
git checkout master  
git pull --rebase 
git checkout dvarchev/Cordova-mocks-update  
git rebase master
```
**Note: If you use TortoiseGit to pull see [tip](#global-rebase) at the bottom how to make it rebase on pull**

If you have previously pushed your feature branch to the remote, push the updates as well.

`git push origin dvarchev/Cordova-mocks-update --force`  

**WARNING: This line may reset remote to you local state on ALL branches including *master*.
See [tip](#push-upstream) at the bottom on how to make it push only to upstream of current branch.**

## Finishing work on feature branch.

When you are finished working on your feature branch, you need to create a Pull Request from your branch to master(or **release** during stabilization phase). Your Pull Request must be reviewed before being merged.
* Update your branch with latest changes and push it to GitHub.
* Use the GitHub web interface to open a Pull Request from your branch to master.
* Your Pull Request will be automatically built by our Jenkins build server and its status will be update accordingly.
* You need **2 ThumbUp-s (:+1:) and a green build** for your Pull Request to be accepted. Only small bug fixes can go with 1 ThumbUp.
* If you need to make additional changes push them again to the same branch. **You should rebase** your branch in order to maintain clean history about the changes (comments will not be lost). You can also squash your commits accordingly. After you make the changes **you need again 2 ThumbUp-s and a green build**.
* Once your Pull Request is reviewed and accepted you can merge it. **You should rebase** your branch in order to maintain clean history.
* Merging:
    - manually - please use the `--no-ff` option if there are more than one commits to merge. otherwise, do a fast-forward merge as the merge commit adds no value.
    - using the GitHub web interface, click the "Merge" button
* Delete the remote branch after merge


# Release Branch Management

On the end of every milestone a "release" branch is created in the Icenium repository to stabilize the build for the upcoming release.

## Creating the release branch

After we create the release branch we keep it until we create the next one(for the next milestone release). This allows us to create hot-fixes directly on the release branch.
The workflow for creating the release branch is:

- Make sure a release tag has been created for the previous release.

- Delete the release branch locally and remotely

```bash
git branch -D release
git push origin :release
```

- Create the release branch from master or any commit you like

```bash
git checkout master
git branch release
```

- Push the local release branch you just created to the Icenium repository

```bash
git push origin release
```

## Fixing bugs during stabilization 
###I have a change that has to be applied to the release. What should I do?

You have to commit your changes only on the release branch. The release branch will be merged into master occasionally and your changes will end up in master after all.

## Git Tortoise Tips

1. After you install Git Tortoise and Generate your SSH key (<a href="http://dbanck.de/2009/10/08/github-windows-and-tortoisegit-part-1-installing-pulling/">how to generate PuTTY key</a>) you should save the key using the generator (as described in the tutorial). Then you should right click somewhere on your file system (where the project is located) and select TortoiseGit -> Settings -> Git -> Remote. Then from the Remote section select "origin" and choose the file where your key is located. Save and you should be able to authenticate from now on.

#Guidelines for commit messages
### All-in-one example:
``` text
Summarize clearly in one line what the commit is about

Describe the problem the commit solves or the use
case for a new feature. Justify why you chose
the particular solution. Don't describe the code, 
describe the intent and the approach.
```

### Summary:
* Summary is the first line of the message. This is the line that'll be seen most often, make it count.
* Summary *should* be around 50 chars and **must** be less than 72 (Github max length before wrap).
* Write the summary line and description of what you have done in the imperative mode, that is as if you were commanding someone. Write “fix”, “add”, “change” instead of “fixed”, “added”, “changed”. This is the convention by the messages generated by git commands, so committing after git revert will yield a consistent message.
* Avoid ending the summary line with a period
* Leave a blank line after the summary (and between other paragraphs).

### Body:
* Bullet points are okay.
* If it seems difficult to summarize what your commit does, it may be because it includes several logical changes or bug fixes, and are better split up into several commits.
* Wrap it to around 72 lines.

### TeamPulse Items:
* If the commit is related to a TeamPulse item (story or bug), add #id (#123 for example) on a new line in the end of commit message body. Example: fixes #123123
* Do not add TeamPulse item id in the commit message summary.
* Do not add full links to the TeamPulse item in the commit message. Consider adding that information in the Pull Request description.

See also:
* http://who-t.blogspot.com/2009/12/on-commit-messages.html
* https://github.com/blog/926-shiny-new-commit-styles
