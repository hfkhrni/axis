## Run

1. clone this repo, `cd` into it.
2. you need a `.env` file, you can copy the example included `cp example.env .env`,
   the example asssumes you will use docker
3. run `docker compose up -d`,
   two ports are mapped, 3000 for the server and 27017 for mongo,
   you can change mappings in `docker-compose.yaml` if you can't free them on your machine
4. api spec is in `openapi.yaml`,
   you can put it in [swagger's editor](https://editor.swagger.io/) if you want it visualized

note: this setup makes use of an experimental flag in node starting from version 22.7
that allows for running Typescript files with no build step.
wouldn't do this if it was a prod deployment.

## Choices

I used node, typescript, express and mongo as it's the stack i'm more familiar with from the stacks that are used at Axis.

1. Authentication

   - JWT for stateless authentication
   - password hashing with bcrypt

2. Data Model

   - combined User and Account for simplicity,
     probably wouldn't do this in a prod app
     but it satisfies the requirements of this exercise
   - Mongoose schemas with Typescript interfaces

3. Error Handling

   - centralized error handling using express' middleware
     with custom error types
   - logging with Winston

4. Validation

   - request validation using joi

# Challenges

1. Transaction Atomicity

   - transactions need a mongo replica set,
     it was a hassle to set up and i decided against it.
     for now using `await Promise.all([user.save(), transaction.save()])`
     when different db operations are related

2. Testing
   - i couldn't get jest to play nicely with typescript even when using `ts-jest`
     and couldn't get vitest to play nicely with mongoose.
     if given more time i would like to get one of them working for unit and integration tests
