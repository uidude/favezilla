# Favezilla

Template project for
[NPE Toolkit](https://github.com/facebookincubator/npe-toolkit). Also a way to
share books you like!

### Creating your app

`yarn create expo-app your-app-name favezilla`

### Commands

| Command           | Action                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| `yarn web`        | Runs web app locally                                                      |
| `yarn go:ios`     | Runs app in Expo go on iOS simulator or attached device                   |
| `yarn start:ios`  | Runs app in your own iOS build (need to have run build:ios and installed) |
| `yarn go:android` | Runs app in Expo go on Android emulator or attached device                |
| `yarn admin`      | Runs admin web UI locally                                                 |
| `yarn build:web`  | Runs a full web build in preparation for deploying                        |
| `yarn build:ios`  | Builds and deploys your own iOS app build using Expo's EAS service.       |

### Creating iOS builds

There are two options for running your app on iOS

- **Running in Expo Go**. With Expo Go, you use Expo's existing iOS app, and
  serve the JS from your local server or from a JS deployment. This is an ideal
  flow for developer builds and early testing.
- **Building your own iOS app**. Your own iOS binary has benefits, even beyond
  having your own app icon and startup flow. You can use more React Native
  libraries and features, and it is required to share the app beyond a handful
  of people

For initial development, `yarn ios` will run in Expo Go. When you're ready to
have your own iOS build, you'll need both an Expo account and an Apple Developer
account, and then run `yarn build:ios` for an emulator build, or
`yarn build:ios -e dev` for a developer device build. After running these,
`yarn ios` will run in your own app.

There are four iOS build types:

- `sim` runs in the Simulator and uses Expo dev client, that will ask user where
  to load JavaScript from
- `dev` runs on a real iOS device, but otherwise operates like `sim`
- `alpha` will read from your deployed JS and supports dynamic updates. This
  uses Apple's "ad hoc" build feature which lets you use the app on a maximum of
  100 devices, which need to be listed in your developer account
- `prod` is your live build for the app store. Although this build supports
  dynamic updates, Apple has policies that limit how your app should change
  without an official App Store release, and generally new features will go live
  with a new release
