/* eslint-disable import/no-unresolved */
import fs from 'node:fs';
import glob from 'glob';
import { Relation, RelationServer } from 'relation2-core';

const replaceArray = [];

const slugify = s => String(s).trim().toLowerCase().replace(/\s+/g, '-');

function replaceAnchor(relativePath) {
	let content = fs.readFileSync(relativePath, 'utf8').toString();
	for (const rep of replaceArray) {
		content = content.replace(`#${rep.from}`, `#${rep.to}`);
	}
	fs.writeFileSync(relativePath, content);
}

async function main() {
	const relationServer = new RelationServer();
	const rawRelations = relationServer.read();

	for (const rawRelation of rawRelations) {
		const relation = new Relation(rawRelation);
		const content = await relation.getFromOriginalContent();
		const line = content.split('\n')[relation.fromRange[0] - 1];
		const anchor = slugify(line.replace(/#+ /, ''));

		const content2 = await relation.getToOriginalContent();
		const line2 = content2.split('\n')[relation.toRange[0] - 1];
		const anchor2 = slugify(line2.replace(/#+ /, ''));

		replaceArray.push({
			from: anchor,
			to: anchor2
		});
	}

	const files = glob.sync('./docs/**/*.md', { ignore: ['node_modules/**', 'dist/**'] });
	for (const file of files) {
		replaceAnchor(file);
	}
}

main();
