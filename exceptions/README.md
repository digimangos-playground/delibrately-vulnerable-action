# Configuring Exceptions

Configuring exceptions is a simple process. The structure of the exceptions directory is to contain sub directories which match organisation names, and for those folders to contain .txt files which list the names of rules which should be exempted for that repository. Therefore the structure should look like this:

```
exceptions/
  my-first-org/
    my-first-repository.txt
    my-second-repository.txt
  my-second-org/
    my-first-repository.txt
    my-second-repository.txt

```

The rule exception files simply contain a list of rule names, one per line, as they are described in the rules configuration in the config file. For example:

```
Wikis
Issues
Allow forking
Projects
Allow merge commits
Allow squash merging
Allow rebase merging
Allow auto-merge
Automatically delete head branches
GitHub Pages
Vulnerability alerts
```

## Self-Service Exception Management

If exceptions are being managed in as a self-service. Then it's recommended to use branch protection on the reporting repository which requires approval from the compliance team. The self-serve user (non-compliant repository owner) will be able to create his exceptions file as `exceptions/<org>/<repo>.txt` and then create a pull request which can be reviewed and approved before being added to the compliance exceptions list. This will give a full audit trail of the exceptions.
