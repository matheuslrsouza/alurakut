const METHOD_NOT_ALLOWED = 405;
const COMUNIDADE_ID_MODEL = "976587";

import { SiteClient } from 'datocms-client';
const client = new SiteClient(process.env.DATOCMS_READWRITE_TOKEN);

function create(req, res) {
    if (req.method !== 'POST') {
        res.status(METHOD_NOT_ALLOWED)
            .json({error: 'Somente método POST é permitido nesta API'});
    }

    client.items.create({
        itemType: COMUNIDADE_ID_MODEL,
        ...req.body
    }).then(record => {
        res.status(200)
            .json({
                data: record
            })
    }).catch(error => {
        res.status(error.statusCode)
            .json({
                error: error.statusText
            });
    });
}

export default create;