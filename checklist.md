### Setup

- [ ] Commit your code after running `yarn create expo-app` so you can easily
      view further changes
- [ ] Set up your Firebase project to get a working backend (only takes five
      minutes)

### First Dpeloyments

- **Data Access**

  - [ ] Set up your allowlist to limit users who can access the site

- **Web**
  - [ ] Reserve a URL on `*.web.app` in Firebase, or alternately reserve a
        domain if you known what you want
  - [ ] Add your redirect URIs in Firebase
  - [ ] Push your app!

### Trusted Tester Rollout

- **Polish**
  - [ ] Change the `About` page to show information about your app
  - [ ] Get an icon for your app! It doesn't have to be fancy (can use Dall-E or
        Midjourney for fun), and set it for all of the app icons in
        `/client/assets`
- **Data Access**
  - [ ] Ensure your allowlist is set up, and have a process to quickly add new
        users
  - [ ] Review of Firebase privacy rules to ensure that data is only visible to
        who is intended
  - _Depending on type of trusted tester program, it may be sufficient to have
    high level rule that limits all data access to users on allowlist._

### Launch

- **Terms of Service**
  - [ ] Write your Terms of Service
  - [ ] Add link on login page
  - [ ] Add link to Settings
  - [ ] Review approach with a lawyer
- **Data Access**

  - [ ] Move user reads and writes to a server-side call
  - [ ] Thorough review of Firebase privacy rules
    - _Without safety net of allowlist, holes can easily be exploited._
  - [ ] Thorough review of rules for accessing every deployed Firebase function
    - _Server calls can have admin access to data, so you need to ensure that
      you validate the request and request content are allowed from the user
      making the request._

- **Endpoint protection**

  - [ ] Set up rate-limiting on endpoints to prevent against overload
        (accidental or malicious)
    - _Endpoints that accept arbitrarily high request volume are a cost risk if
      nothing else — one bug can cost you $1,000's._

- **Data consistency**
  - Set up cron jobs to
    - [ ] Sync `User` and `Profile` fields from user
    - [ ] Remove Firebase accounts without corresponding `User` objects
    - [ ] Delete objects that no longer have a deletion owner
