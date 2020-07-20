[![Netlify Status](https://api.netlify.com/api/v1/badges/9ab7dd07-71e2-4cdc-adcd-f536bb48c74f/deploy-status)](https://app.netlify.com/sites/memoriizu/deploys)

# Memoriizu
This application is focused on language learning, in which users add the content they want to study, in addition to the period in which they want the content to be distributed.

Users can add or delete languages or content of an existing language through the main interface (first left button). In addition, users can view all the content for each language (second left button).

For each of the existing languages, the system generates a daily session with randomly selected content, emphasizing the failures committed in previous sessions. Users can access these sessions from the central part of the interface.

During each daily session, users must write in the selected language the translation of the word or expression shown, receiving feedback from the application, which indicates whether the resolution provided is correct.

Check out a real example of the application from [here](https://memoriizu.chema22r.com).

## Directory Structure
```
|- /.dependabot
    |- ...
|- /.github
    |- ...
|- /client
    |- /css
        |- ...
    |- /fonts
        |- ...
    |- /img
        |- ...
    |- /js
        |- ...
    |- /libs
        |- ...
    |- css.min.css
    |- index.html
|- /server
    |- /controllers
        |- ...
    |- /models
        |- ...
    |- package-lock.json
    |- package.json
    |- server.js
|- .gitignore
|- package-lock.json
|- package.json
|- Procfile
|- README.md
```
