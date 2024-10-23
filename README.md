# Event Hive Backend

Event Hive is a robust event management platform designed to handle event creation, ticketing, and role-based access for Admins, Organizers, and Attendees. The backend is built with Node.js, Prisma, PostgreSQL, and Express.js, providing essential functionalities such as user management, event creation, payment processing, and more.

##URL

https://event-hive-two.vercel.app/

##Email & Password for role based login

- Admin: sharkar_robin@yahoo.com / 123456
- Organizer: organizer1@example.com / 123456

## Installation

1. Clone the repository:

```bash
  git clone https://github.com/polash016/event-hive
  cd event-hive
```

2. Install the required dependencies:

```bash
 npm install
```

3. Generate Prisma Client:

```bash
 npx generate prisma
```

4. Environment Variables:

```bash
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_SECRET_EXPIRES_IN=jwt_expires_in
JWT_REFRESH=your_jwt_refresh_key
JWT_REFRESH_EXPIRES_IN=expires_in
RESET_PASS_LINK=reset_pass_link
RESET_PASSWORD_EXPIRES_IN=reset_password_expires_in
RESET_PASSWORD_TOKEN=reset_password_token
SALT_ROUNDS=salt_round_for_password_hash
SEND_EMAIL_PASS=smtp_email_passcode
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL=your_smtp_email
SMTP_PASSWORD=your_smtp_password
STRIPE_SECRET_KEY=your_stripe_secret_key

```

5. Running the App:

```bash
 npm run dev
```

## Feedback

If you have any feedback, please reach out to us at fake@fake.com

## Documentation

[Documentation](https://linktodocumentation)

## Models

- User: Stores user data, including Google sign-in support.

- Admin, Organizer, Attendee: Role-based extensions of the user.
- Event: Manages event data, including tickets, guests, images, etc.
- Payment: Handles payment transactions.
- Category and EventCategory: Manages event categories and their relationships.

## APIs

- User Authentication: Sign in with Google, register, and login via JWT.
- Event Management: CRUD operations for event creation, updating, and viewing.
- Payment Handling: Payment processing for event tickets via Stripe or SSLCommerz.
- Role-based Access: Role-specific functionalities for Admins, Organizers, and Attendees.

## Role-based Access Control

- SUPER_ADMIN: Has full access across the platform.
- ADMIN: Can manage users, events, and payments.
- ORGANIZER: Can create and manage their own events.
- ATTENDEE: Can view and purchase event tickets.

## Postman Collection

https://documenter.getpostman.com/view/30063298/2sAY4rF5hv
