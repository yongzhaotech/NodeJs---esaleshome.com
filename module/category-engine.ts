'use strict';

import type { NextFunction, Request, Response } from 'express';
import { mysql as sql } from '../utils';

interface CategoryRequest extends Request {
	body: Record<string, unknown>;
}

const requiredText = (value: unknown): string => typeof value === 'string' ? value.trim() : '';

const sendDatabaseError = (res: Response, error: unknown): void => {
	console.error('Category API database operation failed', error);
	res.status(500).send({ error: 'Unable to save the category information. Please try again.' });
};

const saveCategory = async (req: CategoryRequest, res: Response): Promise<void> => {
	const action = requiredText(req.body.frm_action),
		name = requiredText(req.body.new_category),
		nameCn = requiredText(req.body.new_category_cn);

	if (action !== 'new_category' && action !== 'edit_category') {
		res.status(400).send({ error: 'Unsupported category action.' });
		return;
	}
	if (!name || !nameCn) {
		res.status(400).send({ error: 'Enter both the category name and its Chinese text.' });
		return;
	}
	if (name.length > 60 || nameCn.length > 60) {
		res.status(400).send({ error: 'Category names must be 60 characters or fewer.' });
		return;
	}

	if (action === 'new_category') {
		const result = await sql.executeStmt(
			'insert into category (name, create_time, name_cn) values (?, now(), ?)',
			[name, nameCn]
		);
		if (result.error) {
			sendDatabaseError(res, result.error);
			return;
		}
		res.send({ message: 'Category created.', page: 'save-category', refresh: 'categories' });
		return;
	}

	const categoryId = requiredText(req.body.category);
	if (!/^\d+$/.test(categoryId)) {
		res.status(400).send({ error: 'Select a category to edit.' });
		return;
	}

	const existing = await sql.executeQuery('select', 'category', { id: categoryId });
	if (existing.error) {
		sendDatabaseError(res, existing.error);
		return;
	}
	if (!existing.data?.length) {
		res.status(404).send({ error: 'The selected category could not be found.' });
		return;
	}

	const result = await sql.executeTransaction([
		{
			stmt: 'update category set name = ?, name_cn = ? where id = ?',
			bind: [name, nameCn, categoryId]
		},
		{
			stmt: 'update item set category_name = ?, category_name_cn = ? where category_id = ?',
			bind: [name, nameCn, categoryId]
		}
	]);
	if (result.error) {
		sendDatabaseError(res, result.error);
		return;
	}
	res.send({ message: 'Category updated.', page: 'save-category', refresh: 'categories' });
};

const saveSubcategory = async (req: CategoryRequest, res: Response): Promise<void> => {
	const action = requiredText(req.body.frm_action);
	if (action === 'new_subcategory') {
		const categoryId = requiredText(req.body.category),
			name = requiredText(req.body.sub_category),
			nameCn = requiredText(req.body.sub_category_cn);

		if (!/^\d+$/.test(categoryId) || !name || !nameCn) {
			res.status(400).send({ error: 'Enter both subcategory names and select a category.' });
			return;
		}
		if (name.length > 60 || nameCn.length > 60) {
			res.status(400).send({ error: 'Subcategory names must be 60 characters or fewer.' });
			return;
		}

		const category = await sql.executeQuery('select', 'category', { id: categoryId });
		if (category.error) {
			sendDatabaseError(res, category.error);
			return;
		}
		const parent = category.data?.[0];
		if (!parent) {
			res.status(404).send({ error: 'The selected category could not be found.' });
			return;
		}

		const result = await sql.executeStmt(
			'insert into item (name, name_cn, create_time, category_id, category_name, category_name_cn) values (?, ?, now(), ?, ?, ?)',
			[name, nameCn, categoryId, parent.name, parent.name_cn]
		);
		if (result.error) {
			sendDatabaseError(res, result.error);
			return;
		}
		res.send({ message: 'Subcategory created.', page: 'save-subcategory', refresh: 'subCategories' });
		return;
	}

	if (action === 'edit_subcategory') {
		const itemId = requiredText(req.body.item),
			name = requiredText(req.body.new_subcategory),
			nameCn = requiredText(req.body.new_subcategory_cn);

		if (!/^\d+$/.test(itemId) || !name || !nameCn) {
			res.status(400).send({ error: 'Enter both subcategory names and select a subcategory to edit.' });
			return;
		}
		if (name.length > 60 || nameCn.length > 60) {
			res.status(400).send({ error: 'Subcategory names must be 60 characters or fewer.' });
			return;
		}

		const result = await sql.executeQuery('update', 'item', { id: itemId }, { name, name_cn: nameCn });
		if (result.error) {
			sendDatabaseError(res, result.error);
			return;
		}
		res.send({ message: 'Subcategory updated.', page: 'save-subcategory', refresh: 'subCategories' });
		return;
	}

	res.status(400).send({ error: 'Unsupported subcategory action.' });
};

const routeHandler = (handler: (req: CategoryRequest, res: Response) => Promise<void>) =>
	(req: Request, res: Response, next: NextFunction): void => {
		void handler(req as CategoryRequest, res).catch(next);
	};

exports.saveCategory = routeHandler(saveCategory);
exports.saveSubcategory = routeHandler(saveSubcategory);
