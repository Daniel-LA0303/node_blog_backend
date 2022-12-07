import Post from '../models/Post.js';

//registra un user
const registerPost = async (req, res) => {

    //evitar email o usuarios duplicados
    try {
        const post = new Post(req.body);
        await post.save();

        res.json({ msg: "Post creado correctamente."})
    } catch (error) {
        console.log(error);
    }
}

const getAllPosts = async (req, res, next) =>{
    try {
        const post = await Post.find({})
        res.json(post);
    } catch (error) {
        console.log(error);
        next();
    }
}

const getOnePost = async (req, res, next) =>{

    try {
        const post = await Post.findById(req.params.id);
        res.json(post);    
    } catch (error) {
        console.log(error);
        res.json({msg: 'This post does not exist'});
        next();
    }
}

//update a post
const updatePost = async(req, res, next) => {

    console.log(req.params);
    console.log(req.body);
    
    let post = req.body;
    try {
        if(req.body.previousName){
            fs.unlinkSync(__dirname+`/../uploads/${req.body.previousName}`);
            console.log('archivo eliminado');
        }
        let post = await Post.findByIdAndUpdate(
            {_id: req.params.id},{
                title: req.body.title,
                desc: req.body.desc,
                content: req.body.content,
                linkImage: req.body.linkImage,
                categoriesPost: req.body.categoriesPost,
                categoriesSelect: req.body.categoriesSelect,
            },
            {new: true}
        )
        res.json({msg: 'Post has been edited'});
    } catch (error) {
        console.log(error);
    }
}

const deletePost = async (req, res, next) =>{
    
    //search info about
    const post = await Post.findById(req.params.id)
    //first delete the image
    // if(post.linkImage !== ''){
    //     try {
    //         fs.unlinkSync(__dirname+`/../uploads/${post.linkImage}`);
    //         console.log('archivo eliminado');
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    //delete info from db
    try {
        await Post.findByIdAndDelete({_id: req.params.id});
        res.json({msg: 'The post has been eliminated'})
    } catch (error) {
        console.log(error);
        next();
    }
}

export {
    registerPost,
    getAllPosts,
    getOnePost,
    updatePost,
    deletePost
}