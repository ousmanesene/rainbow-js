var api = [
        {url: "data.json", method: "GET", key: "activities", property: "activities", reuseCache: 0},
        {url: "data.json", method: "GET", key: "meal", property: "meal", reuseCache: 0}
    ];
var pml = new RainbowVM('vm', new PMLVM(), 'pml', null, api);

function PMLVM(){
    var self = this;
    
    self.proxy = null;
    self.firstname = 'Ousmane';
    self.password = 'pass';
    self.email = 'test@email.fr';
    self.neededCal = 1752;
    self.bestWeight = 68300;
    self.actualWeight = 80000;
    self.balance = 0;
    self.usedCal = 0;
    self.savedCal = 0;
    self.meal = {
        "selectedIndex":1,
        "options":[
            {"value": "Croissant", "calories":437},
            {"value": "Pains choco", "calories":392},
            {"value": "Chaus au P.", "calories":300}
        ]
    };
    self.activities = {
        "selectedIndex":1,
        "options":[
        {"value": "Jogging 7Km en 49min", "calories":456},
            {"value": "Jogging 1h", "calories":527},
            {"value": "Glander 1h", "calories":78},
            {"value": "Faire les courses 1h", "calories":242},
            {"value": "Marche (3 km/h) 1h", "calories":190},
            {"value": "Marche (8 km/h) 1h", "calories":467}
        ]
    };
    
    var roundDecimal = function (n, accuracy){
        var accuracy = accuracy || 2;
        var tmp = Math.pow(10, accuracy);
        return Math.round( n*tmp )/tmp;
    };
    
    var calculateBalance = function(){
        var cals = self.savedCal - self.usedCal - self.neededCal;
        self.proxy.balance = roundDecimal(cals / 9) + 'g';
    };
    
    self.confirm = function(key, value){
        var result = null;
        alert('pass');
        if (self[key] === value){
            result = value;
        }
        
        return result;
    };
    
    self.isEmail = function(key, email){
        var result = null;
        var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        alert('email');
        if (pattern.test(email)){
            result = email;
            
        }
        
        return result;
    };
    
    self.addMeal = function(){
        var key = self.meal.selectedIndex;
        var option = self.meal.options[key];
        self.proxy.savedCal += option.calories;
        calculateBalance();
    }
    
    self.addActivity = function(){
        var key = self.activities.selectedIndex;
        var option = self.activities.options[key];
        self.proxy.usedCal += option.calories;
        calculateBalance();
    }
    
    return self;
}