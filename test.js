var api = [
{url: "data.json", method: "GET", key: "activities", property: "activities", reuseCache: 0},
{url: "data.json", method: "GET", key: "meal", property: "meal", reuseCache: 0}
];
var test = new RainbowVM('vm', new TestVM(), 'test', null, api);

function TestVM(){
    var self = this;
    
    self.firstname = 'Ousmane';
    self.password = 'pass';
    self.email = 'test@email.fr';
    self.checkbox = true;
    self.checkboxes = [true, false];
    self.radio = true;
    self.radios = [true, false];
    self.select = {
        "selectedIndex":1,
        'options':[{"value": "option1"}, {"value": "option2"}, {"value": "option3"}]
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
    
    return self;
}