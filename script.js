
const allowedEmployees = [
"employee1@company.com",
"employee2@company.com",
"gauravk5732@gmail.com",
"employee4@company.com",
"employee5@company.com",
"employee6@company.com",
"employee7@company.com",
"employee8@company.com",
"employee9@company.com",
"employee10@company.com"

]






const questions = {
1: "The participant proactively seeks clarity on expectations of the managerial role and aligns actions accordingly.",
2: "The participant aligns with stakeholders to understand their priorities, constraints, and success measures.",
3: "The participant sets individual and team goals that are specific, measurable, and clearly defined.",
4: "The participant establishes timelines and checkpoints to review progress and performance of self and team.",
5: "The participant provides feedback that is specific, objective, and based on observed behaviors or data.",
6: "The participant holds constructive and timely feedback conversations, even when they are difficult.",
7: "The participant uses regular one-on-one conversations to build confidence, clarity, and accountability within the team.",
8: "The participant adopts a coaching approach by asking questions that help team members find their own solutions.",
9: "The participant delegates tasks appropriately, ensuring they are aligned with the right roles and capabilities.",
10: "The participant allocates responsibilities to help team members learn, stretch, and develop.",
11: "The participant develops well-defined plans with clear goals and timelines.",
12: "The participant differentiates clearly between high-priority and low-priority tasks and plans accordingly.",
13: "The participant builds trust through open dialogue and empowers the team to make decisions.",
14: "The participant fosters an environment where their team feels safe to share ideas and speak up.",
15: "The participant recognizes and appreciates team members' efforts and contributions.",
16: "The participant communicates ideas clearly, concisely, and in a structured manner.",
17: "The participant analyzes information and presents insights that support quick, informed decision-making.",
18: "The participant creates compelling presentations that highlight key business priorities and actions.",
19: "The participant demonstrates clarity in identifying which team members need recognition, direction, or empowerment.",
20: "The participant flexes the leadership style to match the performance and development needs of each team member.",
21: "The participant takes ownership not just for individual work, but for the team's outcomes and success.",
22: "The participant creates clarity on roles, responsibilities, and performance expectations within the team."
}

const supabaseUrl = "https://txzsqozfavuqzprmzryg.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4enNxb3pmYXZ1cXpwcm16cnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzcyMjksImV4cCI6MjA4ODIxMzIyOX0.pn9xeUrgBEi-VP-YePv3lR-Z1a3-mnaqlFQOyjTNZQs"

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey)

async function loginWithMagicLink(){

const email = document.getElementById("email").value.toLowerCase()

if(!allowedEmployees.includes(email)){
alert("You are not authorized to access this assessment.")
return
}

localStorage.setItem("userEmail", email)

const { error } = await supabaseClient.auth.signInWithOtp({

email: email,

options:{
emailRedirectTo: "https://inspireone-assessment-system.vercel.app/assessment.html" + email
}

})

if(error){
alert("Error sending login link")
}else{
alert("Login link sent! Check your email.")
}

}


// LOGOUT
function logout(){

localStorage.removeItem("userEmail")

window.location.href = "index.html"

}
async function saveAssessment(){

const selfRatings = getRatings("self")
const managerRatings = getRatings("manager")

const email = localStorage.getItem("userEmail")

for(const id in selfRatings){

await supabaseClient
.from("responses")
.insert({
question_id: id,
score: selfRatings[id],
user_email: email,
rating_type: "self"
})

}

for(const id in managerRatings){

await supabaseClient
.from("responses")
.insert({
question_id: id,
score: managerRatings[id],
user_email: email,
rating_type: "manager"
})

}

alert("Assessment saved successfully")

}
async function loadResponses(){

const { data, error } = await supabaseClient
.from("responses")
.select("*")
.order("submitted_at", { ascending: false })

if(error){
console.log(error)
return
}

const grouped = {}

data.forEach(row => {

const key = row.user_email + "_" + row.question_id

if(!grouped[key]){
grouped[key] = {
user: row.user_email,
question: questions[row.question_id],
self: "",
manager: "",
time: row.submitted_at
}
}

if(row.rating_type === "self"){
grouped[key].self = row.score
}

if(row.rating_type === "manager"){
grouped[key].manager = row.score
}

})

const tableBody = document.querySelector("#table tbody")
tableBody.innerHTML = ""

Object.values(grouped).forEach(row => {

const tr = document.createElement("tr")

const localTime = new Date(row.time + "Z")
.toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})

tr.innerHTML = `
<td>${row.user}</td>
<td>${row.question}</td>
<td>${row.self}</td>
<td>${row.manager}</td>
<td>${localTime}</td>
`

tableBody.appendChild(tr)

})

}
async function exportCSV(){

const { data, error } = await supabaseClient
.from("responses")
.select("*")
.order("submitted_at", { ascending: false })

if(error){
console.log(error)
return
}

let csv = "User,Question ID,Self Score,Manager Score,Submitted At\n"
let questionNumber = 1

const grouped = {}

data.forEach(row => {

const key = row.user_email + "_" + row.question_id

if(!grouped[key]){
grouped[key] = {
user: row.user_email,
qid: "Q" + row.question_id,
self: "",
manager: "",
time: row.submitted_at
}
}

if(row.rating_type === "self"){
grouped[key].self = row.score
}

if(row.rating_type === "manager"){
grouped[key].manager = row.score
}

})

Object.values(grouped).forEach(row => {

const localTime = new Date(row.time + "Z")
.toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})

csv += `${row.user},${row.qid},${row.self},${row.manager},${localTime}\n`

})

const blob = new Blob([csv], { type: "text/csv" })
const url = window.URL.createObjectURL(blob)

const a = document.createElement("a")
a.href = url
a.download = "assessment_responses.csv"
a.click()

window.URL.revokeObjectURL(url)

}
function lockManagerUntilSelfComplete(){

const selfRatings = getRatings("self")

const managerFields = document.querySelectorAll('select[data-kind="manager"]')

let selfComplete = true

for(const id in selfRatings){

if(!selfRatings[id]){
selfComplete = false
break
}

}

managerFields.forEach(field=>{
field.disabled = !selfComplete
})

}






