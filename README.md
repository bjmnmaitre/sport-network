# Sport Network

A social sports platform designed to make athletic activity a genuinely social experience.

## Vision

Sport Network aims to become a European social graph for sports practice, where each athletic activity can become:
- Personal progression
- Social interaction
- Discovery
- Conversation
- Challenge
- Meeting
- Group session
- Learning opportunity
- Professional connection
- Commercial/community opportunity

## Core Principles

1. **Athletic activity is the core product**
2. **Personal progression valued equally with social comparison**
3. **Social features must be authentic and progressively built**
4. **Athlete meeting is a strategic opportunity, introduced gradually**
5. **Privacy and security designed from the start**
6. **Multisport-native architecture from inception**
7. **AI starts in background, becomes gradually visible**
8. **Evolves from French local community to European platform**
9. **Professionals, brands, and sports actors integrated later without degrading athlete experience**
10. **Inclusive design for all levels**

## Project Structure

```
sport-network/
├── backend/                 # Node.js/TypeScript backend
│   ├── src/
│   │   ├── api/             # REST controllers
│   │   ├── application/     # Service layer
│   │   ├── domain/          # Core models and types
│   │   │   ├── sport-specific/   # Sport-specific data types
│   │   │   ├── sport.ts        # Sport types and location
│   │   │   ├── activity-metrics.ts # Shared metrics
│   │   │   ├── activity-plan.ts  # Activity plan model
│   │   │   ├── activity.ts       # Activity model
│   │   │   └── sport-specific-data.ts # Discriminated union for sport data
│   │   ├── infrastructure/  # Database entities, configuration
│   │   └── index.ts         # Express server entry point
│   ├── src/__tests__/       # Unit tests
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── frontend/                # TODO: Frontend application
├── docs/                    # Documentation
├── infra/                   # Infrastructure as Code
├── scripts/                 # Utility scripts
└── CLAUDE.md                # Product vision and architecture guidelines
```

## Key Features

### ActivityPlan vs Activity Distinction

- **ActivityPlan**: User's intention to perform an activity (e.g., "I want to run 5km Saturday at 6:30")
- **Activity**: The actual performed activity (recorded workout)
- **Important**: The link between ActivityPlan and Activity is **optional**, not automatic.

### Multisport Native Architecture

- Core entities (`Activity`, `ActivityPlan`) contain generic fields
- Sport-specific data handled via discriminated unions
- Easy to add new sports without modifying core schema
- Initial sports: Running, Cycling, Fitness, Swimming, Trail
- Extensible to team sports (Football, Basketball, Volleyball, etc.)

### Backend Technology Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (with TypeORM for JSONB support)
- **Validation**: Class Validator / Class Transformer
- **Testing**: Jest with TS-Jest
- **Environment**: Dotenv for configuration

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd sport-network/backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

4. Run database migrations (when implemented):
   ```bash
   # npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Testing

Run the test suite:
```bash
npm test
```

## API Endpoints

### Activity Plans
- `GET /api/users/:userId/activity-plans` - Get user's activity plans
- `POST /api/users/:userId/activity-plans` - Create new activity plan
- `GET /api/users/:userId/activity-plans/:planId` - Get specific plan
- `PUT /api/users/:userId/activity-plans/:planId` - Update plan
- `DELETE /api/users/:userId/activity-plans/:planId` - Delete plan
- `PATCH /api/users/:userId/activity-plans/:planId/status` - Update plan status
- `GET /api/users/:userId/activity-plans/upcoming` - Get upcoming plans

### Activities
- `GET /api/users/:userId/activities` - Get user's activities
- `POST /api/users/:userId/activities` - Record new activity
- `GET /api/users/:userId/activities/:activityId` - Get specific activity
- `PUT /api/users/:userId/activities/:activityId` - Update activity
- `DELETE /api/users/:userId/activities/:activityId` - Delete activity
- `GET /api/users/:userId/activities/recent` - Get recent activities
- `GET /api/users/:userId/activities/statistics` - Get activity statistics

## Extensibility

To add a new sport:

1. Add the sport to `SportType` enum in `src/domain/sport.ts`
2. Create a specific data file in `src/domain/sport-specific/` (e.g., `tennis-data.ts`)
3. Update `SportSpecificData` union in `src/domain/sport-specific-data.ts` to include the new type
4. No changes needed to core `Activity` or `ActivityPlan` entities

## License

MIT