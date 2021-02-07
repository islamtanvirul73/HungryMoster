//==================================    User Interface Controller ====================
const UICtrl=(function(){

    const UISelectors={
        searchInput:"#search-input",
        searchBtn:"#search-btn",
        clickableArea: ".clickableArea",
        showcaseDiv: "#showcase",
        menuDetailsDiv: "#menu-details",
        reciepeLink:".recipe-link",
        errorMessageDiv:"#error-message"

    }
    //-------------------------UI Controller Public Method
    return{
        getUISelectors:() => UISelectors,

        populateMeal:  (listOfMeal)=>{
            const showcaseDiv=document.querySelector(UISelectors.showcaseDiv);
            let html="";
            listOfMeal.forEach((meal,indx)=>{
               html=html+`<div class="col-md-3 pb-3">
                        <div class="card" id="item-${indx}">
                            <img src="${meal.ImgUrl}" class="card-img-top img-fluid" alt="">
                             <h5 class="card-title text-center">${meal.name}</h5>
                        </div></div>`
            });
            showcaseDiv.innerHTML=html;
        },

        setMealDetails:(meal)=>{
            const showMealDetailsDiv=document.querySelector(UISelectors.menuDetailsDiv);
            let html=`<div class="card mx-auto">
                    <img src="${meal.ImgUrl}" class="card-img-top" alt="">
                    <div class="card-body">
                        <h4 class="card-title mb-3 text-center">${meal.name}</h4>
                        <h5 class="card-subtitle mb-3">Ingredients</h5><ul>`;

                    meal.ingredients.forEach(ingr=>{
                        html+=`<li><i class="fas fa-check-square"></i>
                                ${ingr}
                            </li>`});

                    html+=`</ul></div></div>`;
                    showMealDetailsDiv.innerHTML=html;
                    showMealDetailsDiv.scrollIntoView();
        },        

        showWarningMessage:message=>{
            const errDiv=document.querySelector(UISelectors.errorMessageDiv);
            errDiv.innerText=message;
            setTimeout(() =>errDiv.innerText="", 1500);
        },

        clearUI:function(){
            document.querySelector(UISelectors.menuDetailsDiv).innerHTML="";
            document.querySelector(UISelectors.showcaseDiv).innerHTML="";
        }
    }
})();

//==================================    Data Controller ====================

const DataCtrl=(function(){
    //Class Declearation for storing meal object
    const Meal=function(name,ImgUrl,ingredients){
        this.name=name;
        this.ImgUrl=ImgUrl;
        this.ingredients=ingredients;
    }
    let MealList=[];

        //-------------------------Data Controller  Public Method
    return{
        fetchDataFromAPI:function(searchKey){
            return fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchKey}`)
            .then(response=>response.json())
            .then(res=> res);
        },
        AddMeal: function(meals){
            MealList=[];
            meals.forEach(meal => {
                const name=meal.strMeal;
                const ImgUrl=meal.strMealThumb;
                const ingredients=[];
                let i;
                for(i=1;i<=20;i++){
                    let index="strIngredient"+i;
                    if(meal[index]){
                        ingredients.push(meal[index]);
                    }else{
                        break;
                    }
                }
                MealList.push(new Meal(name,ImgUrl,ingredients)); });
        },
        getListOfMeal: ()=>MealList,
        
        getMealByID:(id)=>MealList[id]
    }
})();

//==================================    Apps Controller ====================
const AppCtrl=(function(UICtrl,DataCtrl){

    const UISelectors=UICtrl.getUISelectors();

    //Load Event Listener
    const loadEventListener=function(){
        document.querySelector(UISelectors.searchBtn).addEventListener("click",searchButtonClicked);
        document.querySelector(UISelectors.showcaseDiv).addEventListener("click",clickedOnMeal);
    }();

    //Search Button Action
    function searchButtonClicked(e){

        //Read Input Field
        const searchKey= document.querySelector(UISelectors.searchInput).value;
        if(!searchKey){UICtrl.showWarningMessage("Enter a keyword first.!"); UICtrl.clearUI(); return}

        //Fetch Data
        const dataPromise=DataCtrl.fetchDataFromAPI(searchKey);
        let data;
        dataPromise.then(data=>{
            //Check if Any Meal Found
            if(!data.meals){
                //Show Warning Message
                UICtrl.showWarningMessage("No Meal Found..!!")
                UICtrl.clearUI();
            }else{
                //Store in internal data structure
                DataCtrl.AddMeal(data.meals);

                //Get List of Meal
                const listOfMeal=DataCtrl.getListOfMeal();
                //Clear Display
                UICtrl.clearUI();
                //Display in UI
                UICtrl.populateMeal(listOfMeal);
            }
        })
        .catch(err=>{
            UICtrl.showWarningMessage(err);
             UICtrl.clearUI();
        });
    }

    function clickedOnMeal(e){
        //Check if Clicked on card
        if(e.target.parentElement.className=="card"){
            //Get index of that reciepe
            const id=  e.target.parentElement.id.split("-")[1];
            console.log(id)
            //Get meal from Internal Data Structure
            const meal=DataCtrl.getMealByID(id);
            //Write on UI
            UICtrl.setMealDetails(meal)
            console.log(meal)
        }}   
})(UICtrl,DataCtrl);
