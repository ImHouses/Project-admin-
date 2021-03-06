/*
    REST API FOR PROJECT MANAGEMENT APP.
*/

const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

/* MongoDB conection. */
const connection = (closure) => {
    return MongoClient.connect('mongodb://localhost:27017', (err, client) => {
        if (err) return console.log(err);

        closure(client.db('admin_test'));
    });
};

/* Error handling. */
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

/* Response handling. */
let response = {
    status: 200,
    data: [],
    message: null
};

/*  GET for companies, every company has all it's projects in the output JSON.*/
router.get('/companies', (req, res) => {
    connection((db) => {
        db.collection('companies')
            .aggregate([ 
                {'$lookup': 
                    {"from": 'projects', "localField": '_id', "foreignField": 'companyId', "as": 'companyProjects'} 
                }
            ])
            .toArray((err, r) => {
                if(err) {
                    sendError(err, res);
                }
                response.data = r;
                response.message = 'GET successful';
                res.json(response);
            });
    });
});

/* GET projects, every project has a company in the output JSON.*/
router.get('/projects', (req, res) => {
    connection((db) => {
        db.collection('projects')
            .aggregate([
                {'$lookup':
                    {"from": 'companies', "localField": 'companyId', "foreignField": '_id', "as": 'projectCompany'}
            }
            ])
            .toArray((err, r) => {
                if(err) {
                    sendError(err, res);
                }
                response.data = r;
                response.message = 'GET sucessful';
                res.json(response);
            });
    });
});

/* POST project. */
router.post('/projects', (req, res) => {
    connection((db) => {
        db.collection('projects')
            .insertOne(req.body, (err, r) => {
                if(err) {
                    sendError(err, res);
                }
                response.data = r.ops;
                response.message = 'POST successful';
                res.json(response);
            });
    });
});

/* PUT project. */
router.put('/projects/:projectId', (req, res) => {
    const body = req.body;
    const query = {_id: parseInt(req.params.projectId)}
    const newValues = {
        _id: body._id,
        name: body.name,
        initDate: body.initDate,
        endDate: body.endDate,
        companyId: body.companyId
    };
    connection((db) => {
        db.collection('projects')
            .updateOne(query, {$set: newValues},
                (err, r) => {
                if(err) {
                    sendError(err, res);
                }
                response.message = 'PUT project sucessful';
                response.result = r.result;
                response.data = [];
                res.json(response);
            });
    });
});

/* DELETE project. */
router.delete('/projects/:projectId', (req, res) => {
    const query = {_id: parseInt(req.params.projectId)};
    connection((db) => {
        db.collection('projects')
            .deleteOne(query, (err, r) => {
                if(err) {
                    sendError(err, res);
                }
                response.message = 'DELETE project successful';
                response.data = [];
                res.json(response);
            });
    });
});

module.exports = router;