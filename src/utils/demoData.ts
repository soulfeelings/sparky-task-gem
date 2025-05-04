
export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  assignedTo: string; // User ID
  completed: boolean;
  deadline?: Date;
  category?: "homework" | "chores" | "learning" | "health" | "other";
  createdBy: string; // Parent ID
  createdAt: Date;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  image?: string;
  category?: "material" | "activity" | "virtual";
  createdBy: string; // Parent ID
}

export interface UserStats {
  userId: string;
  totalPoints: number;
  pointsSpent: number;
  tasksCompleted: number;
  tasksInProgress: number;
}

export const demoTasks: Task[] = [
  {
    id: "task1",
    title: "Clean your room",
    description: "Make your bed and tidy up your toys",
    points: 10,
    assignedTo: "child1",
    completed: false,
    category: "chores",
    createdBy: "parent1",
    createdAt: new Date(),
  },
  {
    id: "task2",
    title: "Do math homework",
    description: "Complete pages 12-15 in your workbook",
    points: 15,
    assignedTo: "child1",
    completed: true,
    category: "homework",
    createdBy: "parent1",
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "task3",
    title: "Read for 20 minutes",
    description: "Read your favorite book for at least 20 minutes",
    points: 8,
    assignedTo: "child1",
    completed: false,
    category: "learning",
    createdBy: "parent1",
    createdAt: new Date(),
  },
  {
    id: "task4",
    title: "Help set the table",
    description: "Help set the table for dinner",
    points: 5,
    assignedTo: "child2",
    completed: false,
    category: "chores",
    createdBy: "parent1",
    createdAt: new Date(),
  },
  {
    id: "task5",
    title: "Practice piano",
    description: "Practice piano for 30 minutes",
    points: 12,
    assignedTo: "child2",
    completed: true,
    category: "learning",
    createdBy: "parent1",
    createdAt: new Date(Date.now() - 172800000),
  },
];

export const demoRewards: Reward[] = [
  {
    id: "reward1",
    title: "Ice cream trip",
    description: "Visit the ice cream shop for a special treat",
    pointsCost: 30,
    category: "activity",
    createdBy: "parent1",
  },
  {
    id: "reward2",
    title: "New toy",
    description: "Choose a new toy (up to 500 rubles)",
    pointsCost: 100,
    category: "material",
    createdBy: "parent1",
  },
  {
    id: "reward3",
    title: "Extra screen time",
    description: "30 minutes of additional screen time",
    pointsCost: 20,
    category: "virtual",
    createdBy: "parent1",
  },
  {
    id: "reward4",
    title: "Water park visit",
    description: "A trip to the water park on the weekend",
    pointsCost: 200,
    category: "activity",
    createdBy: "parent1",
  },
];

export const demoUserStats: Record<string, UserStats> = {
  child1: {
    userId: "child1",
    totalPoints: 25,
    pointsSpent: 10,
    tasksCompleted: 2,
    tasksInProgress: 2,
  },
  child2: {
    userId: "child2",
    totalPoints: 12,
    pointsSpent: 0,
    tasksCompleted: 1,
    tasksInProgress: 1,
  },
};

export const getCategoryEmoji = (category: string) => {
  switch (category) {
    case "homework":
      return "📚";
    case "chores":
      return "🧹";
    case "learning":
      return "🎓";
    case "health":
      return "💪";
    case "material":
      return "🎁";
    case "activity":
      return "🎯";
    case "virtual":
      return "🎮";
    default:
      return "✨";
  }
};

export const getAvailablePoints = (userId: string) => {
  const stats = demoUserStats[userId];
  if (!stats) return 0;
  return stats.totalPoints - stats.pointsSpent;
};
