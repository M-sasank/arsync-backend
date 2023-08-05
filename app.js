const express = require('express');
const { Octokit } = require("@octokit/rest");

const app = express();

const accessToken = process.env.GITHUB_TOKEN;
// console.log(accessToken);
const octokit = new Octokit({
    auth: accessToken,
});


async function getTags(user, repository) {
    const result = await octokit.request('GET /repos/{owner}/{repo}/tags', {
        owner: user,
        repo: repository,
        headers: {
            authorization: accessToken,
        }
    })
    // console.log(result["data"]);
    return result["data"];
}

async function addTags(user, repository) {
    const commit_sha = await getLatestCommit(user, repository);
    // console.log(commit_sha);
    await octokit.request('POST /repos/{owner}/{repo}/git/tags', {
        owner: user,
        repo: repository,
        tag: 'arsync',
        message: 'arsync message',
        object: commit_sha,
        type: 'commit',
        headers: {
            authorization: accessToken,
        }
    })
    console.log("Tag added successfully!");
}

async function addRepoTopic(user, repository) {
    await octokit.request('PUT /repos/{owner}/{repo}/topics', {
        owner: user,
        repo: repository,
        names: [
            'arsync'
        ],
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })
}
async function getRepositories(user) {
    const result = await octokit.request('GET /users/{username}/repos', {
        username: user,
        headers: {
            authorization: accessToken,
        }
    })
    var repo = [];
    for (let i = 0; i < result["data"].length; i++) {
        // const tags = await getTags(user, result["data"][i]["name"])
        if (result["data"][i]["topics"][0] == "arsync") {
            var repoJSON = {
                "name": result["data"][i]["name"],
                "updated_at": result["data"][i]["updated_at"],
            }
            // console.log(tags);
            repo.push(repoJSON);
            // console.log(result["data"][i]["name"]);
        };

    }
    return repo;
}

async function getLatestCommit(user, repository) {
    const commitList = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner: user,
        repo: repository,
        headers: {
            authorization: accessToken,
        }
    })
    // console.log(commitList["data"][0]["sha"]);
    return commitList["data"][0]["sha"];
}
async function createOrUpdateWorkflow(user, repository, filePath) {
    try {
        // Checking for file
        const { data: existingFile } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: user,
            repo: repository,
            path: filePath,
        })

        //updating file if exists
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: user,
            repo: repository,
            path: filePath,
            message: 'updated workflow',
            committer: {
                name: 'Team Last Minute',
                email: 'lastmin@gmail.com'
            },
            headers: {
                authorization: accessToken,
            },
            content: 'bmFtZTogVGVzdCBmb3IgdXBkYXRlIG5ldyBmaWxlCm9uOiBbcHVzaF0Kam9iczoKICBidWlsZDoKICAgIHJ1bnMtb246IHVidW50dS1sYXRlc3QKICAgIHN0ZXBzOgogICAgICAtIHVzZXM6IGFjdGlvbnMvY2hlY2tvdXRAdjMKICAgICAgLSBuYW1lOiBJbnN0YWxsIEFyZHJpdmUKICAgICAgICBydW46IHwKICAgICAgICAgIGVjaG8gIkxhdGVzdCBBcmRyaXZlIGluc3RhbGxlZCI=',
            sha: existingFile.sha,
        })
        console.log(`File is updated successfully!`);
    }
    //if file doesn't exist
    catch (error) {
        console.log(`File not found! Created a new file.`);
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: user,
            repo: repository,
            path: filePath,
            message: 'Added workflow by arsync',
            committer: {
                name: 'Team Last Minute',
                email: 'lastmin@gmail.com'
            },
            content: 'bmFtZTogVGVzdCBmb3IgY3JlYXRlIG5ldyBmaWxlCm9uOiBbcHVzaF0Kam9iczoKICBidWlsZDoKICAgIHJ1bnMtb246IHVidW50dS1sYXRlc3QKICAgIHN0ZXBzOgogICAgICAtIHVzZXM6IGFjdGlvbnMvY2hlY2tvdXRAdjMKICAgICAgLSBuYW1lOiBJbnN0YWxsIEFyZHJpdmUKICAgICAgICBydW46IHwKICAgICAgICAgIGVjaG8gIkxhdGVzdCBBcmRyaXZlIGluc3RhbGxlZCI='
            , headers: {
                authorization: accessToken,
            }
        })
    }
    // addTags(user, repository);
    addRepoTopic(user, repository);

}

app.get('/addWorkflow', (req, res) => {
    // user = "M-sasank";
    // repository = 'arweave-hackathon';
    // filePath = '.github/workflows/blank.yaml';
    // createOrUpdateWorkflow(user, repository, filePath);

    res.send("Hello World!");
});

app.get('/', async (req, res) => {
    user = "M-sasank";
    repository = 'arweave-hackathon';
    // const result = await getRepositories(user);
    addRepoTopic(user, repository);
    result = await getRepositories(user);
    res.send(result);
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
