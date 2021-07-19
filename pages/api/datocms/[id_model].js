const METHOD_NOT_ALLOWED = 405;

import { SiteClient } from 'datocms-client';
const client = new SiteClient(process.env.DATOCMS_READWRITE_TOKEN);

async function create(req, res) {
    if (req.method !== 'POST') {
        res.status(METHOD_NOT_ALLOWED)
            .json({error: 'Somente método POST é permitido nesta API'});
    }

    const { id_model } = req.query;

    const record = await client.items.create({
        itemType: id_model,
        ...req.body
    });

    res.status(200)
        .json({
            data: record
        });
}

export default create;