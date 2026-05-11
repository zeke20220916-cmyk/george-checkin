# Firebase setup

This app works locally without Firebase. To enable multi-device sync, create a Firebase project and fill in `firebase-config.js`.

## 1. Create a Firebase project

1. Open the Firebase console.
2. Create a project.
3. Add a Web app.
4. Copy the Firebase config object.

## 2. Enable Authentication

1. Open Authentication.
2. Enable Google as a sign-in provider.
3. Add your deployed domain to Authorized domains after GitHub Pages is ready.

## 3. Create Firestore

1. Open Firestore Database.
2. Create a database.
3. Start in production mode.
4. Choose a region.

## 4. Fill config

Copy `firebase-config.example.js` into `firebase-config.js`, then replace the placeholder values.

The Firebase web config is not a secret. Access control must be handled by Firebase Authentication and Firestore Security Rules.

## 5. Suggested Firestore rules

For a first private family version, restrict access to signed-in emails you trust:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isFamilyMember() {
      return request.auth != null
        && request.auth.token.email in [
          "parent@example.com",
          "another-parent@example.com"
        ];
    }

    match /families/george/state/current {
      allow read, write: if isFamilyMember();
    }
  }
}
```

Replace the email addresses with your real Google accounts.

## 6. Data path

By default, the app writes to:

```js
families/george/state/current
```

You can change it in `firebase-config.js`:

```js
window.GEORGE_FIREBASE_DATA_PATH = "families/george/state/current";
```
