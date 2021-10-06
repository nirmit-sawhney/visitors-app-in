if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}
const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path=require('path');
const sendEmail=require('./utils/sendEmail');
const date=require('date-and-time');
const session=require('express-session');
const flash=require('connect-flash');
const visitor=require('./models/visitors');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log('DB CONNECTED'))
.catch((err)=>console.log(err.message));

const sessionConfig={
    secret:'visitor\'s app code',
    resave:false,
    saveUninitialized:true
}

app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.user=req.user;
    next();
})

const currdate=date.format(new Date(),"ddd, MMM DD YYYY");
const time=date.format(new Date(),"hh:mm A");
app.get('/',(req,res)=>{
    res.render('home',{date:currdate,time});
});

//form to check-in
app.get('/signup',(req,res)=>{
    res.render('signup');
})

//check in and send email
app.post('/signup',async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        //signup user
        const user=await new User({username:username,email:email});
        await User.register(user,password);
        //saving in database
        const newVisitor=await visitor({username,email});
        await newVisitor.save();
        req.flash('success','You are successfully registered, Checkin to continue!');
        res.redirect('/login');
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/error');
    }
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.post('/login',passport.authenticate('local',{failureRedirect:'/login',session:true,failureFlash:true}),(req,res)=>{
    const {username}=req.user;
        req.flash('success',`Welcome ${username}`);
        res.redirect(`/`);
})

app.post('/checkin',async(req,res)=>{
    try{
        const {username,email}=req.user;
    const ifuseralreadycheckedin=await visitor.exists({$and:[{username:{$eq:username}},{status:{$eq:'checked-in'}}]});
        if(ifuseralreadycheckedin){
            req.flash('error','You are already checked-in!!');
            res.redirect('/');
        }
    else{
        const checkedin=await date.format(new Date(),"ddd, MMM DD YYYY | hh:mm A");
    await visitor.updateOne({email:email},{status:'checked-in'});
    await visitor.updateOne({email:email},{checkedin:checkedin});
    const from='nirmitsawhney01@gmail.com';
        const sub=`Hey ${username}!`;
        const text=`You have checked-in to the Visitor\'s App on ${currdate} at ${time}.<br>Thanks and regards<br><strong>Nirmit Sawhney</strong>`;
        sendEmail(email,from,sub,text);
        req.flash('success','You have successfully checked-in');
        res.redirect('/');
    }
    }
    catch(e){
        req.flash('error','OOPS SOMETHING WENT WRONG');
        res.redirect('/error');
    }
})

app.post('/checkout',async(req,res)=>{
     try{
       const {username}=req.user;
       const ifuseralreadycheckedin=await visitor.exists({$and:[{username:{$eq:username}},{status:{$eq:'checked-out'}}]});
        if(ifuseralreadycheckedin){
            req.flash('error','You are not checked-in!!');
            res.redirect('/');
        }
       const checkedout=await date.format(new Date(),"ddd, MMM DD YYYY | hh:mm A");
       const currVisitor=await visitor.findOne({username:username});
       await visitor.updateOne({username:username},{status:"checked-out"});
       await visitor.updateOne({username:username},{checkedout:checkedout});

        const inhour=currVisitor.checkedin.substring(19,21);
        const inmin=currVisitor.checkedin.substring(22,24);
        const outhour=checkedout.substring(19,21);
        const outmin=checkedout.substring(22,24);
   
        const hourduration=Math.abs(outhour-inhour);
        const minduration=Math.abs(outmin-inmin);
   
       const currdate=await date.format(new Date(),"ddd, MMM DD YYYY");
       const time=await date.format(new Date(),"hh:mm A");
       const from='nirmitsawhney01@gmail.com';
       const sub=`Hey ${currVisitor.username}!`;
       const text=`<i>Thankyou for visiting us.</i><br> You have checked-out from the Visitor\'s App on ${currdate} at ${time}. You were active for ${hourduration} hours and ${minduration} minutes. <br>Thanks and regards<br><strong>Nirmit Sawhney</strong>`;
       sendEmail(currVisitor.email,from,sub,text);
       await req.logout();
       req.flash('success',`Thankyou for visiting us, ${currVisitor.username}`);
       res.redirect('/');
     }
     catch(e){
         req.flash('error','OOPS SOMETHING WENT WRONG');
         res.redirect('/error');
     }
})

app.get('/about',(req,res)=>{
    res.render('about');
})

app.get('/visitors',async(req,res)=>{
    const allvisitors=await visitor.find({status:'checked-in'});
    res.render('visitors',{allvisitors});
})

app.get('/error',(req,res)=>{
    res.render('error');
})

app.listen(process.env.PORT || 3000,(req,res)=>{
    console.log('server running at port 3000');
})