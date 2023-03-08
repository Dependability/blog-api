const User = require('../models/user');
const Comment = require('../models/comment');
const Post = require('../models/post');
// const { post } = require('../routes');
const jwt = require('jsonwebtoken');


//add sanitization and validation
exports.register = (req, res, next) => {
    const user_lower = req.body.username.toLowerCase()
    User.findOne({user_lower: user_lower}).exec((err, user) => {
        if (err) {
            return next(err)
        }
        if (user) {
            console.log(user)
            res.json({success: false, 'message': 'Username taken'})
        } else {
            //After password validation.
            //Add password encryption
            
            const newUser = new User({username: req.body.username, user_lower, password: req.body.password});
            newUser.save((err) => {
                if (err) {
                    return next(err);
                }
                jwt.sign({username: newUser.username, _id: newUser._id}, 'secretkey', (err, token) => {
                    if (err) {
                        return next(err);
                    }
                    console.log(token);
                    res.json({success: true, token, user: {_id: newUser._id, username: newUser.username}})
                })

            })

        }


    }) 
}
//add sanitization and validation
exports.login = (req, res, next) => {
    console.log(req.body)
    User.findOne({user_lower: req.body.username.toLowerCase()}, {}, {}).exec((err, user) => {
        if (err) {
            return next(err);
        }

        if (user) {
            //decipher password
            if (req.body.password == user.password) {
                jwt.sign({username: user.username, _id: user._id}, 'secretkey', (err, token) => {
                    if (err) {
                        return next(err);
                    }
                    console.log(token)
                    res.json({success: true, token, user: {_id: user._id, username: user.username}});
                    return
                 })  

            }
            else {
                res.json({success: false, message: 'Incorrect password'})
            }
              
        } else {
            res.json({success: false, message: 'No such username'})
        }
        return
    })
    return
}

exports.verifyToken = (req, res, next) => {
    const bearerTokenFull = req.headers['authorization'];
    console.log(req.headers)
    if (bearerTokenFull) {
        const bearer = bearerTokenFull.split(' ')[1];
        console.log(bearer)
        jwt.verify(bearer, 'secretkey', (err, auth) => {
            if (err) {
                return next(err);
            }
            
            req.auth = auth;
            return next();
        })

    } else {
        res.status(403);
        res.json({message: "Invalid Login"})
    }

}

exports.getPosts = (req, res, next) => {
    Post.find().populate("author").exec((err, posts)=> {
        if (err) {
            console.log(err);
            return next(err);
        }
        res.json({posts});
    })
}

exports.getPost = (req, res, next) => {
    Post.findById(req.params.id).populate("author").exec((err, post) => {
        if (err) {
            return next(err);
        }
        res.json({post})
    })

}

exports.createPost = (req, res, next) => {
    console.log(req.auth)
    const post = {
        author: req.auth._id,
        title: req.body.title,
        body: req.body.body,
    }

    User.findById(post.author).exec((err, user) => {
        if (err) {
            return next(err);
        }

        const newPost = new Post(post);
        newPost.save((err)=>{
            if (err) {
                return next(err);
            }
            res.json({success: true ,message: "Post created successful!", post: newPost})
        })
    })
    
}

exports.updatePost = (req, res, next) => {
    Post.findById({_id: req.params.id}, {}).exec((err, post) => {
        if (err) {
            return next(err);
        }
        if (post.author.toString() !== req.auth._id) {
            res.status(403);
            console.log(post.author.toString())
            console.log(req.auth._id)
            res.json({message: 'Invalid Permissions'})
        } else {
            console.log("Body: ", req.body);
            if (req.body.title) {
                console.log("It has a title")
                post.title = req.body.title;
        }
            if (req.body.body) {
                post.body = req.body.body;
            }
        }
        post.save((err)=> {
            if (err) {
                return next(err);
            }
            console.log(post)
            res.json({post, message:"Update successful!", success: true});
        });
    })
}

exports.deletePost = (req, res, next) => {
    Post.findById(req.params.id).exec((err, post) => {
        if (err) {
            return next(err);
        }
        if (post.author.toString() !== req.auth._id) {
            res.status(403);
            res.json({message: 'Invalid Permissions'})
        } 
        post.remove((err)=> {
            if (err) {
                return next(err);
            }
            res.json({message: "Post deleted successfully!", post})
        });
    })
}

exports.getComments = (req, res, next) => {
    Comment.find({post : req.params.id}).populate('author').exec((err, comments) => {
        if (err) {
            return next(err);
        }
        res.json({comments});
    })
}

exports.createComment = (req, res, next) => {
    const commentBP = {
        post: req.params.id,
        time: Date.now(),
        author: req.auth._id,
        body: req.body.body
    }

    Post.findById(req.params.id).exec((err, foundPost) => {
        if (err) {
            return next(err);
        }
        if (foundPost) {
            const newComment = new Comment(commentBP);
            newComment.save((err)=> {
                if (err) {
                    return next(err);
                }
                res.json({success: true, message: "Comment created successfully", comment: newComment});
            })
        }
    })
}

exports.updateComment = (req, res, next) => {
    Comment.findById(req.params.commentId).exec((err,comment) => {
        if (err) {
            return next(err);
        }
        console.log('Comment', req.params)
        if (comment.author.toString() !== req.auth._id) {
            res.status(403);
            res.json({message: 'Forbidden'})
        } else {
            if (req.body.body)  {
                comment.body = req.body.body
            }
            comment.save((err)=> {
                if (err) {
                    return next(err);
                }
                res.json({message: "Comment updated successfully", comment, success: true})

            })
        }
    })
    
}

exports.deleteComment = (req, res, next) => {
    Comment.findById(req.params.commentId).exec((err,comment) => {
        if (err) {
            return next(err);
        }
        if (comment.author.toString() !== req.auth._id) {
            res.status(403);
            console.log(comment.author)
            console.log(req.auth._id)
            res.json({message: 'Forbidden'})
        } else {
            comment.remove((err)=> {
                if (err) {
                    return next(err);
                }
                res.json({message: "Comment deleted successfully", comment, success: true})

            })
        }
    })
}