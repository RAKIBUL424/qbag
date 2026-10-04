# Qbag — Two-Minute Recruitment Speech

## Spoken version

Good morning. I would like to introduce **Qbag**, a web platform for uploading, organizing, searching, and reviewing university exam-question images.

The main idea is to make academic question discovery easier. Students can search using filters such as university, subject, course, year, semester, and exam type. They can access a free question or purchase a premium search with coins. Users can view their coin balance, transaction history, and time-limited search purchases through the profile and premium pages.

Qbag is a full-stack application. The frontend uses React, Vite, React Router, and Axios. It includes pages for authentication, uploads, premium search, purchase history, pricing, and administration. Shared components include the navigation bar, countdown timers, advertisements, and a screenshot-capture interface. This interface lets users capture part of the screen, crop an image, send it to the OCR service, and use the extracted text.

The backend uses FastAPI, SQLAlchemy, PostgreSQL, Pydantic, and Alembic migrations. It provides REST endpoints for users, uploads, question search, OCR, coin management, and administration. The application uses bearer-token authentication and server-side authorization for protected operations.

The database stores users, questions, question images, coin packages, transactions, search purchases, and search results. For a premium search, the system calculates the total coin price, deducts coins from the appropriate packages, creates a time-limited purchase, and stores the matching results. A scheduled process marks old packages and purchases as expired.

I also worked with question moderation, bulk uploads, OCR-based imports, duplicate detection, user management, coin adjustments, statistics, and database backups.

The most interesting part of this project is how image handling, OCR, moderation, authentication, search, and a coin-based business model work together. Through Qbag, I learned to connect frontend and backend systems, design database relationships, validate APIs, handle file uploads, and consider production concerns such as security, expiration, backups, and deployment. Thank you.

## Delivery notes

- Approximate delivery time: **2 minutes** at a normal presentation pace.
- The speech is written for a technical recruitment interview.
- Replace “I worked on” with your preferred phrasing if presenting the project individually.
