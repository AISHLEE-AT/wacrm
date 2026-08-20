/**
 * TeachO Master Curriculum — Tech & Career Skills (Python AI, Full-Stack, Spoken English)
 */

export interface CurriculumTopic {
  topic: string;
  subtopic: string;
  keyPoints: string[];
}

export const PYTHON_AI_SYLLABUS: CurriculumTopic[] = [
  { topic: 'Python Fundamentals & Data Structures', subtopic: 'Variables, Lists, Tuples, Dictionaries, Sets & List Comprehensions', keyPoints: ['Dynamic Typing & Memory Management', 'List vs Tuple Mutability', 'Dictionary Hashing & O(1) Lookup', 'List Comprehensions syntax'] },
  { topic: 'Object-Oriented Programming (OOP) in Python', subtopic: 'Classes, Objects, Inheritance, Polymorphism, Encapsulation & Dunder Methods', keyPoints: ['__init__ and self convention', 'Multiple & Multilevel Inheritance', 'Method Overriding & super()', 'Dunder Methods (__str__, __repr__, __len__)'] },
  { topic: 'NumPy for High-Performance Scientific Computing', subtopic: 'ndarray, Vectorization, Broadcasting, Matrix Multiplication & Indexing', keyPoints: ['np.array vs Python Lists Performance', 'Broadcasting Rules for Array Shapes', 'Matrix Dot Product np.dot / @ operator', 'Boolean Masking & Filtering'] },
  { topic: 'Pandas for Data Wrangling & Analytics', subtopic: 'DataFrames, Series, Handling Missing Data, GroupBy & Merging Datasets', keyPoints: ['df.loc vs df.iloc indexing', 'df.dropna() vs df.fillna() strategies', 'df.groupby() and Aggregations', 'pd.merge() Inner/Outer/Left Joins'] },
  { topic: 'Data Visualization — Matplotlib & Seaborn', subtopic: 'Line Plots, Bar Charts, Histograms, Heatmaps & Correlation Matrices', keyPoints: ['plt.subplots() figure and axes', 'sns.heatmap(df.corr(), annot=True)', 'Distribution Plots and Outlier Detection', 'Customizing Legends, Grids and Colors'] },
  { topic: 'Machine Learning — Scikit-Learn Supervised Models', subtopic: 'Linear Regression, Logistic Regression, Decision Trees & Random Forests', keyPoints: ['Train-Test Split & Cross Validation', 'Feature Scaling (StandardScaler vs MinMaxScaler)', 'Evaluation Metrics: RMSE, R², Accuracy, F1-Score', 'Hyperparameter Tuning with GridSearchCV'] },
  { topic: 'Deep Learning & Neural Networks Foundations', subtopic: 'Perceptron, Activation Functions (ReLU, Softmax), Loss Functions & Backpropagation', keyPoints: ['Forward Pass and Matrix Weights', 'Vanishing Gradient Problem', 'Cross-Entropy vs MSE Loss', 'Adam Optimizer and Learning Rate'] },
  { topic: 'Generative AI & LLMs with Gemini API', subtopic: 'Prompt Engineering, System Instructions, Structured JSON Outputs & API Key Management', keyPoints: ['Few-shot and Chain-of-Thought Prompting', 'Temperature and Top-P Sampling Parameters', 'Handling Rate Limits & Key Rotation Pools', 'Building Autonomous AI Agents'] }
];

export const FULLSTACK_WEB_SYLLABUS: CurriculumTopic[] = [
  { topic: 'Modern JavaScript (ES6+) & TypeScript Foundations', subtopic: 'Arrow Functions, Promises, Async/Await, Destructuring, Types & Interfaces', keyPoints: ['Event Loop & Microtask Queue', 'Promise.all vs Promise.allSettled', 'TypeScript Interfaces vs Type Aliases', 'Generics and Strict Type Checking'] },
  { topic: 'React.js Component Architecture & Hooks', subtopic: 'useState, useEffect, useMemo, useCallback, useRef & Custom Hooks', keyPoints: ['Virtual DOM and Reconciliation Algorithm', 'Hooks Rules and Dependency Arrays', 'Performance Optimization with React.memo', 'Building Reusable Custom Hooks'] },
  { topic: 'React State Management & Tailwind CSS Styling', subtopic: 'Context API, Zustand / Redux Toolkit, Utility-First CSS & Responsive Design', keyPoints: ['Global State Architecture', 'Zustand Lightweight Store Creation', 'Tailwind Flexbox/Grid Layouts', 'Dark Mode Theming with Tailwind'] },
  { topic: 'Node.js & Express.js REST API Backend', subtopic: 'Routing, Middleware, Request/Response Lifecycle, JWT Authentication & CORS', keyPoints: ['Non-blocking I/O Event Architecture', 'Custom Middleware Creation', 'JWT Token Signing and Verification', 'Error Handling and HTTP Status Codes'] },
  { topic: 'Relational Databases & PostgreSQL / Supabase', subtopic: 'Schema Design, Foreign Keys, Indexing, Transactions & Row-Level Security (RLS)', keyPoints: ['Database Normalization (1NF, 2NF, 3NF)', 'B-Tree Indexing for Query Speed', 'ACID Properties in Transactions', 'Supabase Realtime Subscriptions & RLS'] },
  { topic: 'Full-Stack Deployment, CI/CD & Cloud Hosting', subtopic: 'Docker Containers, Vercel Frontend, Cloud Run Backend & SSL Setup', keyPoints: ['Dockerfile & Multi-stage Builds', 'CI/CD Pipelines with GitHub Actions', 'Environment Variables & Secret Management', 'Production Monitoring & Health Checks'] }
];
