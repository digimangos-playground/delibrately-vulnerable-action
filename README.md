# Repository Compliance Reporting action

> TLDR; Validates whether repositories in organisations are compliant to a set of configurable rules. This tool will create issues with identified problems in every scanned repository and subsequently consolidate all problems into a single JSON report.
> There are two report types available:
> - **Repository Report**: Validates repository settings.
> - **Workflow Report**: Validates Workflow steps.

## Setup

### Pre-requisites

- [Node 16.x+](https://nodejs.org/en/download/)

### Personal Access Token

A personal access token is required with the following permissions:

- [x] `repo`
- [x] `user`
- [x] `read:org`
- [x] `admin:enterprise` - Required for accessing the `teamDiscussionsSetting` value `read:enterprise` is not enough

### Install

```bash
npm install
npm run build && npm run package
```

Run the tests :heavy_check_mark:  

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

### Execution

#### Execution from the console

Application can be executed using node and the specified options.
```
  -c, --command <command name>                        Command to execute
  -t, --token <token>                                 Personal Access Token or GITHUB_TOKEN (or comma separated tokens)
  -e, --enterprise <slug>                             Enterprise slug
  -cd, --config_directory <config_directory>          Path to directory containing configuration files (e.g. rule file)
  -ex, --exceptions_directory <exceptions_directory>  Path to directory containing rule exceptions
  -rr, --reporting_repository <owner/repo>            Optional - Repository specified as Owner/Repo for final report
  -o, --organization <organization_login>             Optional - Limit to specified organization login only
  -rd, --report_directory <path>                      Optional - Specifies the location to write the json report to (defaults to current directory)
```

For example:
```
node dist/index.js -c get_repository_compliance_report -e my-enterprise -cd ./config -ex ./exceptions -rd /tmp/reports -t PAT
```

Output will be a file created in the directory specified by the `-rd, --report_directory <path>` option, with the name `output_TIMESTAMP.json`.

#### Execution as GitHub Workflow

Recommended use for execution as a GitHub Workflow is to store the reporting action as an internal repository and to create a separate reporting repository for each report type. This will make configuration and exceptions easier to manage.

Assuming this approach (with the logic stored in repository `compliance-reports` in organisation `demo-org`):

- Create a new repository (e.g. `workflow-report`)
- Set up the configuration directory by copying over `settings.json` and the appropriate rules file to the `config` directory in this repository
- Copy the exceptions directory to the `exceptions` directory in this repository with the associated README.md
- Create a secret containing the PAT described above called `GH_ACCESS_TOKEN`
- Finally create a workflow file under `.github/workflows` with the following content:

```yaml
name: Workflow Compliance Report
on:
  schedule:
    cron: "0 1 * * *"
    time_zone: "Europe/London"
  workflow_dispatch:

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2.4.0
      - name: Workflow Compliance Report
        uses: demo-org/compliance-reports@main
        with:
          command: get_repository_compliance_report
          token: ${{ secrets.GH_ACCESS_TOKEN }}
          enterprise: my-enterprise-slug
          config_directory: ./config
          exceptions_directory: ./exceptions
          reporting_repository: demo-org/workflow-report
```

When executing as a GitHub action, the JSON report will be added as an artifact to the Worflow Summary:
![Workflow Action Summary](./images/ActionsSummary.png)

## Repository Report (Command Name `get_repository_compliance_report`)

### Configuration

#### Rule definition

Rules are configured in the `repository_rules.json` file. This file simplifies the process of making changes to the test validation, and to add or remove tests. There are two types of rules which can be defined (although they are defined in the same way), one list containing rules which need checking at an organisation level and another which is defined at the repository level.

```json
{
    "organisationRules": [{
        "name": "Team Discussion Settings",
        "description": "This rule is to check whether discussions are enabled for an organisation.",
        "failureMessage": "The setting for team discussions is false but expected true",
        "ruleDefinition": "teamDiscussionsSetting === true"
    }],
    "repositoryRules": [
        {
            "name": "Wikis",
            "description": "This rule is to check that the repository is not configured to use Wikis.",
            "failureMessage": "The setting for Wikis is true but expected false",
            "ruleDefinition": "hasWikiEnabled === false"
        }]
}
```

##### Name

A simple identifier for the rule.

##### Description

A more detailed description of the rule to describe to someone editing the rules with what it's expected to do.

##### FailureMessage

This is the test which describes why the validation failed and will be used when notifying users or teams about deviations from the expected values

##### RuleDefinition

This is a JavaScript test defined against the data retrieved from GitHub's GraphQL API. When executing the report, the JavaScript code will be executed against the object to define whether it meets the values in the test.

#### Exceptions
See [README.md](exceptions/README.md) in the exceptions directory for more information on configuring exceptions.

#### Output
The format for the repository report is:

```jsonc
{
    "status": "OK",
    "data": {
        "organizations": [
            {
                "id": "org_id",
                "name": "org_name",
                "login": "org_login",
                "validationResults": [
                    {
                        "ruleName": "Team Discussion Settings",
                        "passed": true,
                        "validationMessage": null
                    }
                ],
                "repositories": [
                    {
                        "id": "R_YYYYYYYYYY",
                        "name": "therepo",
                        "validationResults": [
                            {
                                "ruleName": "Wikis",
                                "passed": false,
                                "validationMessage": "The setting for Wikis is true but expected false"
                            },
                            {
                                "ruleName": "Issues",
                                "passed": true,
                                "validationMessage": null
                            },
                            ...
```

#### Data Structure for reference

The structure which is being checked against the validation rules is as follows

```jsonc
{
    /* Start of values for organisation tests */
    id: 'org_id',
    login: 'org_login',
    name: 'org_name',
    teamDiscussionsSetting: true,
    /* Although technically you could execute tests of the repositories node this is the end of org values */
    repositories: {
      pageInfo: {
        startCursor: '',
        endCursor: '',
        hasNextPage: false,
        hasPreviousPage: false
      },
      totalCount: 1,
      nodes: [
        {
          /* Start of values for repository tests */
          id: 'R_YYYYYYYYYY',
          name: 'therepo',
          isInOrganization: true,
          hasWikiEnabled: false,
          hasIssuesEnabled: true,
          isPrivate: true,
          forkingAllowed: false,
          hasProjectsEnabled: false,
          mergeCommitAllowed: true,
          squashMergeAllowed: true,
          rebaseMergeAllowed: true,
          autoMergeAllowed: false,
          deleteBranchOnMerge: true,
          vulnerabilityAlertsEnabled: true,
          environments: {
            nodes: [
              {
                id: 'EN_XXXXXXXXZ',
                name: 'Production'
              }
            ]
          },
          branchProtectionRules: {
            nodes: [
              {
                pattern: 'main',
                requiresApprovingReviews: true,
                requiredApprovingReviewCount: 2,
                dismissesStaleReviews: true,
                requiresCodeOwnerReviews: true,
                restrictsReviewDismissals: true,
                bypassPullRequestAllowances: {
                  totalCount: 0
                },
                requiresStrictStatusChecks: true,
                requiresConversationResolution: true,
                requiresCommitSignatures: true,
                requiresLinearHistory: true,
                isAdminEnforced: true,
                restrictsPushes: true,
                allowsForcePushes: false,
                allowsDeletions: false
              }
            ]
          }
          /* End of values for repository tests */
        }
      ]
    }
  }
```


## Workflow Report (Command Name `get_workflow_compliance_report`)

### Configuration

#### Rule definition

Rules are configured in the `workflow_rules.json` file. This file simplifies the process of making changes to the test validation, and to add or remove tests.

```json
{
    "rules": [
        {
            "name": "MyTypeScriptRule",
            "language": "TypeScript",
            "description": "Checks if the TypeScript workflow is valid",
            "failureMessage": "Expected typescript project to have a step named 'Checkout' and use actions/checkout@v2.4.0",
            "step": {
                "name": "Checkout",
                "uses": "actions/checkout@v2.4.0"
            }
        }
    ]
}
```

##### Name

A simple identifier for the rule.

##### Language

This is the language for which the rule applies. If this matches the primary language of the repository then this rule will be used to validate it.

##### Description

A more detailed description of the rule to describe to someone editing the rules with what it's expected to do.

##### FailureMessage

This is the test which describes why the validation failed and will be used when notifying users or teams about deviations from the expected values

##### Step

The step can be defined as either just "name" or with "name" and "uses". When only the name is specified, then workflows will be tested to ensure that a step with the specified name exists in the workflow. When the "uses" is also specified, then the workflow will be tested to ensure that the step with the specified name and uses is defined.

#### Exceptions
See [README.md](exceptions/README.md) in the exceptions directory for more information on configuring exceptions.

#### Output
The format for the workflow report is:

```
{
    "organizations": [
        {
            "id": "O_xxxxxxx",
            "name": "digimangos-report-dev",
            "login": "digimangos-report-dev",
            "validationResults": [],
            "repositories": [
                {
                    "id": "R_yyyyyyy",
                    "name": "repository-compliance-report",
                    "validationResults": [
                        {
                            "ruleName": "MyTypeScriptRule",
                            "passed": true,
                            "validationMessage": null
                        }
                    ]
                },
                {
                    "id": "R_zzzzzz",
                    "name": "workflow-compliance-report",
                    "validationResults": []
                }
            ]
        }
    ]
}
```



## LICENSE

[ISC](LICENSE.md)
