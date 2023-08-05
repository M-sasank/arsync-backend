const express = require('express');
const nodemailer = require('nodemailer');
const { Octokit } = require("@octokit/rest");
require("dotenv").config()
const app = express();
// console.log(">>", process);
const accessToken = process.env.G_AUTH;
// console.log(accessToken);
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
        var repoJSON = {
            "name": result["data"][i]["name"],
            // "commit_msg": await getLatestCommit(user, result["data"][i]["name"]),
            "updated_at": result["data"][i]["updated_at"],
        }
        // console.log(tags);
        repo.push(repoJSON);
        // console.log(result["data"][i]["name"]);
    };
    return repo;
}

async function getArsyncRepositories(user) {
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
                "commit_msg": await getLatestCommit(user, result["data"][i]["name"]),
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
    return commitList["data"][0]["commit"]["message"];
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
            content: 'bmFtZTogQXJkcml2ZSBXb3JrZmxvdwpvbjogW3B1c2hdCmVudjoKICAjIFNldHRpbmcgYW4gZW52aXJvbm1lbnQgdmFyaWFibGUgd2l0aCB0aGUgdmFsdWUgb2YgYSBjb25maWd1cmF0aW9uIHZhcmlhYmxlCiAgZW52X3ZhcjogJHt7IHZhcnMuRU5WX0NPTlRFWFRfVkFSIH19CmpvYnM6CiAgYnVpbGQ6CiAgICBydW5zLW9uOiB1YnVudHUtbGF0ZXN0CiAgICBzdGVwczoKICAgICAgLSB1c2VzOiBhY3Rpb25zL2NoZWNrb3V0QHYzCiAgICAgIC0gdXNlczogYWN0aW9ucy9zZXR1cC1ub2RlQHYzCiAgICAgICAgd2l0aDoKICAgICAgICAgIG5vZGUtdmVyc2lvbjogJzE4JwogICAgICAtIG5hbWU6IEluc3RhbGwgRGVwZW5kZW5jaWVzCiAgICAgICAgcnVuOiB8CiAgICAgICAgIGVjaG8gIkluc3RhbGxpbmcgRGVwZW5kZW5jaWVzLi4uLiEiCiAgICAgIC0gbmFtZTogQnVpbGQgdGhlIHN0YXRpYyB3ZWJzaXRlCiAgICAgICAgcnVuOiB8CiAgICAgICAgIGNkIHN0YXRpYy13ZWJzaXRlCiAgICAgICAgIGxzCiAgICAgIC0gbmFtZTogVXBsb2FkIHRvIEFyZHJpdmUKICAgICAgICBydW46IHwKICAgICAgICAgZWNobyAiVXBsb2FkaW5nIHRvIEFyZHJpdmUuLi4uISIKICAgICAgICAgZWNobyAicmVwb3NpdG9yeSB2YXJpYWJsZSAgJHt7IHZhcnMuUkVQT1NJVE9SWV9WQVIgfX0iCiAgICAgICAgIyAgYXJkcml2ZSAtLWhlbHAKICAgICAgLSBuYW1lOiBDcmVhdGluZyBhIE1hbmlmZXN0CiAgICAgICAgcnVuOiB8CiAgICAgICAgICBlY2hvICJDcmVhdGluZyBhIG1hbmlmZXN0Li4uLiEiCiAgICAgICAgICBlY2hvICJNYW5pZmVzdCBjcmVhdGVkIFN1Y2Nlc3NmdWxseSEi',
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
            content: 'bmFtZTogQXJkcml2ZSBXb3JrZmxvdwpvbjogW3B1c2hdCmVudjoKICAjIFNldHRpbmcgYW4gZW52aXJvbm1lbnQgdmFyaWFibGUgd2l0aCB0aGUgdmFsdWUgb2YgYSBjb25maWd1cmF0aW9uIHZhcmlhYmxlCiAgZW52X3ZhcjogJHt7IHZhcnMuRU5WX0NPTlRFWFRfVkFSIH19CmpvYnM6CiAgYnVpbGQ6CiAgICBydW5zLW9uOiB1YnVudHUtbGF0ZXN0CiAgICBzdGVwczoKICAgICAgLSB1c2VzOiBhY3Rpb25zL2NoZWNrb3V0QHYzCiAgICAgIC0gdXNlczogYWN0aW9ucy9zZXR1cC1ub2RlQHYzCiAgICAgICAgd2l0aDoKICAgICAgICAgIG5vZGUtdmVyc2lvbjogJzE4JwogICAgICAtIG5hbWU6IEluc3RhbGwgRGVwZW5kZW5jaWVzCiAgICAgICAgcnVuOiB8CiAgICAgICAgIGVjaG8gIkluc3RhbGxpbmcgRGVwZW5kZW5jaWVzLi4uLiEiCiAgICAgIC0gbmFtZTogQnVpbGQgdGhlIHN0YXRpYyB3ZWJzaXRlCiAgICAgICAgcnVuOiB8CiAgICAgICAgIGNkIHN0YXRpYy13ZWJzaXRlCiAgICAgICAgIGxzCiAgICAgIC0gbmFtZTogVXBsb2FkIHRvIEFyZHJpdmUKICAgICAgICBydW46IHwKICAgICAgICAgZWNobyAiVXBsb2FkaW5nIHRvIEFyZHJpdmUuLi4uISIKICAgICAgICAgZWNobyAicmVwb3NpdG9yeSB2YXJpYWJsZSAgJHt7IHZhcnMuUkVQT1NJVE9SWV9WQVIgfX0iCiAgICAgICAgIyAgYXJkcml2ZSAtLWhlbHAKICAgICAgLSBuYW1lOiBDcmVhdGluZyBhIE1hbmlmZXN0CiAgICAgICAgcnVuOiB8CiAgICAgICAgICBlY2hvICJDcmVhdGluZyBhIG1hbmlmZXN0Li4uLiEiCiAgICAgICAgICBlY2hvICJNYW5pZmVzdCBjcmVhdGVkIFN1Y2Nlc3NmdWxseSEi'
            , headers: {
                authorization: accessToken,
            }
        })
    }
    // addTags(user, repository);
    addRepoTopic(user, repository);

}

app.get('/', (req, res) => {
    res.send("This page currently does nothing :) Navigate to /addWorkflow to add a workflow. Navigate to /repos to view user repos");
});

app.get('/addWorkflow', (req, res) => {
    user = "M-sasank";
    repository = 'arweave-hackathon';
    filePath = '.github/workflows/blank.yaml';
    createOrUpdateWorkflow(user, repository, filePath);

    res.send("Workflow Successfully added");
});

app.get('/repos', async (req, res) => {
    user = "M-sasank";
    repository = 'arweave-hackathon';
    // const result = await getRepositories(user);
    addRepoTopic(user, repository);
    result = await getRepositories(user);
    res.send(result);
});

app.post('/email', (req, res) => {
    send_mail();
    res.send("Email sent successfully");
});

function send_mail() {
    const { to, subject, text } = {
        "to": "alteek05@gmail.com",
        "subject": "Project arsync",
        "text": "Please click on this link to login with ardrive!"
    };

    // Replace these credentials with your actual email credentials
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'sasankmadati@gmail.com',
            pass: process.env.GMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: 'sasankmadati@gmail.com',
        to,
        subject,
        text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            // res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            // res.send('Email sent successfully');
        }
    });
}

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
