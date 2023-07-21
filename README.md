# Node Js API Project

## Description

Simple Signup and SignIn and also added the OTP for verifying the email

## Installation

To run this project locally, follow these steps:

1. Clone the repository to your local machine using the following command:

```
git clone https://github.com/RuberDucky/nodejsAPi
```

2. Navigate to the project directory:

```
cd nodejsApi
```

3. Install the required dependencies:

```
npm install express pg bcrypt body-parser cors nodemailer fs
```

## Usage

you can use this anywhere in your web panel and in building mobile applications. and also in your desktop apps.

## API Endpoints

- `POST /signup`: Sign up a new user with email, password, and confirm password. Receive a 4-digit OTP in response.
- `POST /login`: Log in with email and password. Receive user information in response if successful.
- `POST /otp-verify`: Verify the OTP sent during the signup process. Returns success if OTP matches.

[Include other API endpoints and their descriptions here.]

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- bcrypt (for password hashing)
- etc.



## License

MIT License, Apache License 2.0.

## Contact

[contact me](wa.me/923166096609)
