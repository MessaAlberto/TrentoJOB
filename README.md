# Project Name

This README provides a guide to setting up and running the project locally, along with additional information about its features, technologies used, and how to contribute.

## Setup

To set up and run this project locally, follow these steps:

### Installation

1. Clone the repository from GitHub:

   ```bash
   git clone https://github.com/MessaAlberto/TrentoJOB.git
   ```

2. install the required dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root of the project.
   - Add the following environment variables to the `.env` file:

     ```env
        PORT=3000
        MONGODBURI=your_mongodb_uri

        JWT_SECRET_TOKEN=your_jwt_secret_token
        JWT_EXPIRE_TOKEN=30d

        JWT_SECRET_REFRESH=your_jwt_secret_refresh
        JWT_EXPIRE_REFRESH=30d

        JWT_SECRET_MAIL=30
        JWT_EXPIRE_MAIL=30d

        MAIL_SERVICE=your_mail_service
        MAIL=your_mail
        MAIL_SECRET=your_mail_secret
     ```

     Adjust these variables according to your specific requirements.


### Running the project
To run the application locally in development mode, use the following command:

```bash
npm run devStart
```
This command will start the server and make your application available at http://localhost:3000.