# Train Service Management System

This is a Train Ticket Booking System built using Node.js, Express, and MongoDB. It allows users to register, log in, manage their wallet, and purchase tickets for trains.

## Run Locally

Clone the project

```bash
  git clone https://github.com/Dipjitbaroi/Train-service-management-system
```

Go to the project directory

```bash
  cd Train-service-management-system
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

Start the server in "development"

```bash
  npm run dev
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`JWT_SECRET`=`a9f25e9b54f0bcbd8f3b8a30dd8fe046ffb524dbf9b5b0baff6f2b39892704ebfb2c2564b27d8920af9b3219280b3ef07be8d80f242f1f2d170b8d9cf9a8a5bc`

`MONGO_URI`=``

`PORT`=`5000`

`CORN_SCHEDULE`=`0 0 * * *`

`STRIPE_SECRET_KEY`=`sk_test_51QCNwXCW9OinBfwSB5FnJG5gH04Dz4JHwY8THqJMaKXpm5Z0hAhe5lZYT43LOrYls1BPD6KYdxa7bgYRtcQAoDkj00gxgV6RAz`

## Branches

- Branch 01 ("without_online_wallet_integration") = in this branch all the transaction handle with local wallet.
- Branch 02 ("with_online_wallet_stripe_integrated") = in this branch all the transaction handle with stripe wallet.

## Roadmap

I have already inserted many datas in this DB for tasting. But if you like to do any change or crude oparations by using these apis then follow these steps:

- Register to create user.

- Register & Login with admin user for any crude oparetions in admin site datas like (Ex. Add Stations, Add Train Informations or like to do any Update/Delete in that kind of data).

- Now add some Stations with appropriate datas.

- Now add Train with appropriate station datas.

- Register & Login with user for any kind of user oparations like (Ex. Purchase Ticket, etc).

- Now you can buy that admin added train ticket as a user.

## Features

- Maintained JWT Authentications
- Used Node.js scheduling libraries like node-cron for "autoGenerateSchedule"
- Handled financial transactions.
- This system can automatic calculate the "Per_Unit_Fair" & "Total_Ticket_Fare" by using the your journey distance and the per_km_ticket cost.
