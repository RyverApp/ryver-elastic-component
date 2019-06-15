# ryver-elastic-component
Ryver component for elastic.io environment

### Prerequisites
* [node ^10.15.0](https://nodejs.org/)
* [yarn ^1.4.0](https://yarnpkg.com/)

### Develop
1. Clone the repo.
2. `yarn install`

### Scripts
* `yarn red-marker` - Show Typescript errors.
* `yarn build` - Build the project.

## Flows
* Use Elastic.io's Webhook component as a trigger, followed by a Ryver component action.
* `POST` requests to your flow's Webhook url.
* Use the properties in an action's `in.json` schema file for your request body.