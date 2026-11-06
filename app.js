var app = angular.module('taskApp', []);

app.controller('PlannerController', function($scope, $interval) {

    // Current Date and Navigation State
    $scope.currentDate = new Date();
    $scope.currentTab = 'dashboard';
    $scope.switchTab = function(tab) { $scope.currentTab = tab; };

    // Dark Mode state
    $scope.isDarkMode = false;
    $scope.toggleDarkMode = function() {
        $scope.isDarkMode = !$scope.isDarkMode;
        localStorage.setItem('bloom_dark_mode', $scope.isDarkMode);
    };
    if(localStorage.getItem('bloom_dark_mode') === 'true') {
        $scope.isDarkMode = true;
    }

    // Daily Motivational Quotes rotation
    var quotes = [
        "Small daily progress adds up to huge results.",
        "The secret of getting ahead is getting started.",
        "Focus on being productive instead of busy.",
        "Your future is created by what you do today, not tomorrow."
    ];
    $scope.dailyQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Load LocalStorage Data
    var savedData = JSON.parse(localStorage.getItem('bloom_master_planner')) || {};
    
    $scope.tasks = savedData.tasks || [
        { id: 1, title: 'Complete OS Process Scheduling lab assignment', description: 'Implement Round Robin scheduler in C', priority: 'High', category: 'Academics', completed: false, dueDate: '2026-11-15' },
        { id: 2, title: 'DSA Practice: Binary Trees & Graphs', description: 'Solve 5 problems on LeetCode', priority: 'Medium', category: 'Academics', completed: false, dueDate: '' },
        { id: 3, title: 'Weekly Groceries & Supplies', description: 'Milk, fruits, and study snacks', priority: 'Low', category: 'Shopping', completed: true, dueDate: '' }
    ];

    // Subject-wise Study Planner
    $scope.subjects = savedData.subjects || [
        { name: 'OS', hours: 12 },
        { name: 'Java', hours: 18 },
        { name: 'DSA', hours: 25 },
        { name: 'LDCO', hours: 10 },
        { name: 'Web Technology', hours: 15 },
        { name: 'AI', hours: 8 }
    ];

    $scope.habits = savedData.habits || [{ id: 1, name: 'Drink 2L water daily' }, { id: 2, name: 'Code for 1 hour' }];
    $scope.exams = savedData.exams || [{ title: 'Operating Systems Midterm', date: '2026-11-20' }];
    $scope.quickNotes = savedData.quickNotes || 'Remember to review system calls and CPU scheduling algorithms!';

    // Smart Task Recommendation
    $scope.smartSuggestion = "Focus on high-priority academic tasks early in the morning for maximum retention.";

    // Task Form
    $scope.isEditing = false;
    $scope.editId = null;
    $scope.taskForm = { title: '', description: '', priority: 'Medium', category: 'Academics', recurrence: 'None', dueDate: null };

    $scope.selectedCategory = 'All';
    $scope.searchQuery = '';
    $scope.setCategory = function(cat) { $scope.selectedCategory = cat; };
    $scope.categoryFilter = function(task) {
        if ($scope.selectedCategory === 'All') return true;
        return task.category === $scope.selectedCategory;
    };

    // Save Task
    $scope.saveTask = function() {
        if (!$scope.taskForm.title) return;
        if ($scope.isEditing) {
            var t = $scope.tasks.find(x => x.id === $scope.editId);
            if(t) {
                t.title = $scope.taskForm.title;
                t.description = $scope.taskForm.description;
                t.priority = $scope.taskForm.priority;
                t.category = $scope.taskForm.category;
                t.dueDate = $scope.taskForm.dueDate;
            }
            $scope.isEditing = false;
            $scope.editId = null;
        } else {
            $scope.tasks.push({
                id: Date.now(),
                title: $scope.taskForm.title,
                description: $scope.taskForm.description,
                priority: $scope.taskForm.priority,
                category: $scope.taskForm.category,
                completed: false,
                dueDate: $scope.taskForm.dueDate || ''
            });
        }
        $scope.taskForm = { title: '', description: '', priority: 'Medium', category: 'Academics', recurrence: 'None', dueDate: null };
        $scope.saveData();
    };

    $scope.editTask = function(task) {
        $scope.isEditing = true;
        $scope.editId = task.id;
        $scope.taskForm = {
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: task.category,
            recurrence: 'None',
            dueDate: task.dueDate ? new Date(task.dueDate) : null
        };
        $scope.switchTab('tasks');
    };

    // Deletion Modal
    $scope.showDeleteModal = false;
    $scope.pendingDeleteId = null;
    $scope.confirmDelete = function(id) { $scope.pendingDeleteId = id; $scope.showDeleteModal = true; };
    $scope.executeDelete = function() {
        $scope.tasks = $scope.tasks.filter(t => t.id !== $scope.pendingDeleteId);
        $scope.showDeleteModal = false;
        $scope.saveData();
    };
    $scope.cancelDelete = function() { $scope.showDeleteModal = false; };

    // Subject Management
    $scope.addSubject = function() {
        if(!$scope.newSubjectName) return;
        $scope.subjects.push({ name: $scope.newSubjectName, hours: 0 });
        $scope.newSubjectName = '';
        $scope.saveData();
    };
    $scope.deleteSubject = function(name) {
        $scope.subjects = $scope.subjects.filter(s => s.name !== name);
        $scope.saveData();
    };
    $scope.addStudyHour = function(sub) {
        sub.hours = (sub.hours || 0) + 1;
        $scope.saveData();
    };

    // Pomodoro Timer
    $scope.timerSeconds = 25 * 60;
    $scope.timerRunning = false;
    var timerPromise = null;

    $scope.formatTime = function(sec) {
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    };
    $scope.setTimerMode = function(mins) {
        $scope.pauseTimer();
        $scope.timerSeconds = mins * 60;
    };
    $scope.startTimer = function() {
        if(!$scope.timerRunning) {
            $scope.timerRunning = true;
            timerPromise = $interval(function() {
                if($scope.timerSeconds > 0) {
                    $scope.timerSeconds--;
                } else {
                    $scope.pauseTimer();
                    alert('Pomodoro session completed! Time for a break.');
                }
            }, 1000);
        }
    };
    $scope.pauseTimer = function() {
        $scope.timerRunning = false;
        if(timerPromise) $interval.cancel(timerPromise);
    };
    $scope.resetTimer = function() {
        $scope.pauseTimer();
        $scope.timerSeconds = 25 * 60;
    };

    // Calendar Matrix Generator
    $scope.calendarDays = [];
    for(var i = 1; i <= 30; i++) { $scope.calendarDays.push(i); }

    // Habits & Exams
    $scope.addHabit = function() {
        if(!$scope.newHabitName) return;
        $scope.habits.push({ id: Date.now(), name: $scope.newHabitName });
        $scope.newHabitName = '';
        $scope.saveData();
    };
    $scope.deleteHabit = function(id) {
        $scope.habits = $scope.habits.filter(h => h.id !== id);
        $scope.saveData();
    };
    $scope.addExam = function() {
        if(!$scope.examForm || !$scope.examForm.title) return;
        $scope.exams.push({ title: $scope.examForm.title, date: $scope.examForm.date });
        $scope.examForm = {};
        $scope.saveData();
    };

    // Metrics
    $scope.getPendingCount = function() { return $scope.tasks.filter(t => !t.completed).length; };
    $scope.getCompletedCount = function() { return $scope.tasks.filter(t => t.completed).length; };
    $scope.getProgressPercent = function() {
        if ($scope.tasks.length === 0) return 0;
        return Math.round(($scope.getCompletedCount() / $scope.tasks.length) * 100);
    };
    $scope.isOverdue = function(dateStr) {
        if(!dateStr) return false;
        return new Date(dateStr) < new Date();
    };

    // Export & Backup
    $scope.exportToCSV = function() {
        var csv = "Title,Category,Priority,Status,Due Date\n";
        $scope.tasks.forEach(t => {
            csv += `"${t.title}","${t.category}","${t.priority}","${t.completed ? 'Done' : 'Pending'}","${t.dueDate}"\n`;
        });
        var blob = new Blob([csv], { type: 'text/csv' });
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'bloom_tasks.csv';
        link.click();
    };
    $scope.backupData = function() {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
        var dl = document.createElement('a');
        dl.setAttribute("href", dataStr);
        dl.setAttribute("download", "bloom_backup.json");
        dl.click();
    };

    // Persistence Layer
    $scope.saveData = function() {
        var payload = {
            tasks: $scope.tasks,
            subjects: $scope.subjects,
            habits: $scope.habits,
            exams: $scope.exams,
            quickNotes: $scope.quickNotes
        };
        localStorage.setItem('bloom_master_planner', JSON.stringify(payload));
    };
});