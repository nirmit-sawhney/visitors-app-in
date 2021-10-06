if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}
const sgMail=require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail=(to,from,subject,text)=>{
    const msg={
        to,
        from,
        subject,
        html:text,
    }

    sgMail.send(msg,(err)=>{
        if(err){
            console.log('Hooh! Email not sent!');
        }
        else{
            console.log('Email sent successfully');
        }
    })
}

module.exports=sendEmail;