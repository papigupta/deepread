
### 🧱 Updated Architecture (Imprint – April 2025)

#### **1. Users**

Basic identity, streaks, and session tracking.

| Field                | Type      | Notes                               |
| -------------------- | --------- | ----------------------------------- |
| `id`                 | UUID      | Primary key                         |
| `pen_name`           | string    | User-facing identity                |
| `email`              | string    | Optional                            |
| `streak_count`       | int       | Consecutive daily practice sessions |
| `last_practice_date` | date      | Tracks streak + recent activity     |
| `created_at`         | timestamp | Account creation                    |

#### **2. Books**

Books added manually by the user (not global catalog).

| Field                 | Type      | Notes                                            |
| --------------------- | --------- | ------------------------------------------------ |
| `id`                  | UUID      | Primary key                                      |
| `user_id`             | UUID      | FK to Users                                      |
| `title`               | string    | Book title                                       |
| `author`              | string    | Book author                                      |
| `cover_url`           | string    | From Open Library API                            |
| `open_library_id`     | string    | Optional identifier                              |
| `added_at`            | timestamp | When the user added the book                     |
| `understanding_score` | float     | Avg score from LLM feedback (0–1)                |
| `application_score`   | float     | Same                                             |
| `clarity_score`       | float     | Same                                             |
| `overall_score`       | float     | Weighted/combined score (0–1); derived or stored |


### **3. Insights**

Core ideas extracted from each book—can be prewritten or LLM-generated.

|Field|Type|Notes|
|---|---|---|
|`id`|UUID|Primary key|
|`book_id`|UUID|FK to Books|
|`concept_title`|string|Short label or name of the idea|
|`concept_text`|text|Full idea or quote|
|`chapter_name`|string|Optional grouping label|
|`source_reference`|string|Optional page/section for context|
|`difficulty`|enum|`easy`, `medium`, `hard`|
|`type`|enum|`concept`, `framework`, `quote`, etc.|
|`tags`|array|For clustering or future search|


### **4. PracticeSessions**

Every time a user engages with an insight, we log it here.

|Field|Type|Notes|
|---|---|---|
|`id`|UUID|Primary key|
|`user_id`|UUID|FK to Users|
|`book_id`|UUID|FK to Books|
|`insight_id`|UUID|FK to Insights|
|`submitted_at`|datetime|Timestamp of session|
|`response_text`|text|Transcribed or typed answer|
|`llm_feedback`|JSON|Scores and qualitative analysis from LLM|
|`eval_score`|float|Aggregated feedback score (0–1)|
|`user_feedback_score`|int|Optional 1–5 rating of LLM feedback (future)|
|`auto_difficulty_next`|enum|Where to go next: `easier`, `same`, `harder`|


### **5. Neurons (Visual Layer)**

Not a physical table. Derived dynamically from PracticeSessions + Insights.

Each `Insight` = a **node**  
If practiced → **glows**  
If not → **dimmed**  
Connections based on:

- Shared tags
- Chapter proximity
- Response depth over time


#### **LLM Integration (Backend)**

LLMs power 3 main actions:

| Task                   | Input                            | Output                               |
| ---------------------- | -------------------------------- | ------------------------------------ |
| **Insight Generation** | Book/chapter summary             | 10–50 concepts per book              |
| **Prompt Generation**  | Chosen concept + user history    | Custom prompt: explain, apply, etc.  |
| **Evaluation**         | User response + original insight | Scores (clarity, application, depth) |

All LLM usage is API-based (OpenAI GPT-3.5/4-Turbo), budgeted under ₹5,000/month.