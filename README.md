
# Medium Clone

## Overview

This project is a clone of the popular blogging platform Medium. It replicates key features and functionalities of Medium, providing users with a familiar experience while exploring and sharing content.

## Tech Stack

### Backend

- **Cloudflare Workers with Hono**: Powers the backend infrastructure, providing robust and scalable functionality.
- **Zod**: Used for validation on the backend, ensuring data integrity and security.
- **TypeScript**: Language of choice for backend development, enabling type safety and enhanced developer productivity.
- **Prisma**: ORM (Object-Relational Mapping) tool used for efficient database management.
- **PostgreSQL**: Relational database management system chosen for its reliability and scalability.
- **JWT**: Enables secure user authentication, enhancing the platform's security.
- **Password Hashing**: Implemented to enhance user data security by securely storing passwords.

### Frontend

- **React**: Frontend framework used for building interactive user interfaces.
- **Tailwind CSS**: Styling framework utilized for crafting sleek and responsive UI components.
- **TypeScript**: Language of choice for frontend development, ensuring type safety and code clarity.
- **Zod**: Utilized for frontend type inference and validation, enhancing data consistency and reliability.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/swamibuddhachaitanya/Medium-Clone.git
   ```

2. **Install dependencies**:
   ```bash
   cd Medium-Clone
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file based on the provided `.env.example`.
   - Populate the necessary environment variables with appropriate values.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open your browser and navigate to `https://medium-clone-ltlq-rk0kuoruh-swamibuddhachaitanyas-projects.vercel.app/signup` to access the Medium clone application.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your fork.
5. Submit a pull request to the main repository's `main` branch for review.
