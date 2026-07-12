# TransitOps API Documentation

Base URL: `http://localhost:4000/api`

All endpoints except `POST /auth/login`, `POST /auth/refresh`, and `GET /health` require `Authorization: Bearer <accessToken>`.

## Demo Users

| Role | Email | Password |
| --- | --- | --- |
| Fleet Manager | `manager@transitops.local` | `TransitOps@123` |
| Driver | `driver@transitops.local` | `TransitOps@123` |
| Safety Officer | `safety@transitops.local` | `TransitOps@123` |
| Financial Analyst | `finance@transitops.local` | `TransitOps@123` |

## Authentication

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Core Resources

Every list endpoint supports `page`, `pageSize`, `search`, `sortBy`, `sortOrder`, plus relevant filters such as `status`, `type`, `region`, `driverId`, `startDate`, and `endDate`.

| Resource | Endpoints | Roles |
| --- | --- | --- |
| Vehicles | `GET/POST /vehicles`, `GET/PUT/DELETE /vehicles/:id` | Fleet Manager; Financial Analyst read |
| Drivers | `GET/POST /drivers`, `GET/PUT/DELETE /drivers/:id`, `PATCH /drivers/:id/suspend` | Fleet Manager; Safety Officer read/update/suspend |
| Trips | `GET/POST /trips`, `GET/PUT/DELETE /trips/:id`, `PATCH /trips/:id/dispatch`, `PATCH /trips/:id/complete`, `PATCH /trips/:id/cancel` | Fleet Manager; Driver assigned read/complete |
| Maintenance | `GET/POST /maintenance`, `PUT/DELETE /maintenance/:id`, `PATCH /maintenance/:id/start`, `PATCH /maintenance/:id/close` | Fleet Manager |
| Fuel Logs | `GET/POST /fuel-logs`, `DELETE /fuel-logs/:id` | Fleet Manager; Financial Analyst read |
| Expenses | `GET/POST /expenses`, `PUT/DELETE /expenses/:id` | Fleet Manager; Financial Analyst read |

## Analytics And Reports

- `GET /dashboard`
- `GET /search?q=<term>`
- `GET /reports/fuel-efficiency`
- `GET /reports/operational-cost`
- `GET /reports/fleet-utilization`
- `GET /reports/driver-performance`
- `GET /reports/maintenance-cost`
- `GET /reports/vehicle-roi`

Reports accept `?format=csv` or `?format=pdf`.

## Trip Business Rules

- Vehicle must be `AVAILABLE`.
- Driver must be `AVAILABLE`.
- Driver license must not be expired.
- Cargo weight cannot exceed vehicle capacity.
- One driver and one vehicle can only have one `DISPATCHED` trip.
- Dispatch changes vehicle and driver to `ON_TRIP`.
- Completion restores vehicle and driver to `AVAILABLE` and increments odometer.
- Cancellation restores statuses when the trip was already dispatched.
